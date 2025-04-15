"use client";

import { useState, useEffect } from "react";
import * as React from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useLanguage } from "@/utils/i18n";
import {
  ArrowLeftIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  TrashIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { FaWhatsapp } from "react-icons/fa";
import { supabase } from "@/utils/supabase";
import withAuth from "@/contexts/withAuth";

// Types
interface BrickLoad {
  id: string;
  villageName: string;
  phoneNumber: string;
  brickQuantity: number;
  brickRate: number;
  totalAmount: number;
  amountPaid: number;
  date: string;
  createdAt: string;
}

interface BrickLoadLog {
  id: string;
  brickLoadId: string;
  date: string;
  logType: "brick" | "payment";
  brickQuantity?: number;
  brickRate?: number;
  amount: number;
  createdAt: string;
}

function BrickLoadDetail() {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [brickLoads, setBrickLoads] = useState<BrickLoad[]>([]);
  const [filteredLoads, setFilteredLoads] = useState<BrickLoad[]>([]);
  const [selectedLoad, setSelectedLoad] = useState<BrickLoad | null>(null);
  const [loadLogs, setLoadLogs] = useState<BrickLoadLog[]>([]);

  // Form states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBrickLogModal, setShowBrickLogModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showDeleteMode, setShowDeleteMode] = useState(false);
  const [loadToDelete, setLoadToDelete] = useState<string | null>(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  // Add state for log deletion
  const [showDeleteLogMode, setShowDeleteLogMode] = useState(false);
  const [logToDelete, setLogToDelete] = useState<string | null>(null);
  const [showDeleteLogConfirmation, setShowDeleteLogConfirmation] =
    useState(false);

  // Form fields
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [villageName, setVillageName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [brickQuantity, setBrickQuantity] = useState("");
  const [brickRate, setBrickRate] = useState("");
  const [amountPaid, setAmountPaid] = useState("");

  // For adding new brick log
  const [newBrickQuantity, setNewBrickQuantity] = useState("");
  const [newBrickRate, setNewBrickRate] = useState("");
  const [newBrickDate, setNewBrickDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  // For adding new payment
  const [newPaymentAmount, setNewPaymentAmount] = useState("");
  const [newPaymentDate, setNewPaymentDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  // Load data
  useEffect(() => {
    fetchBrickLoads();
  }, []);

  // Filter loads based on search
  useEffect(() => {
    if (searchQuery) {
      const filtered = brickLoads.filter(
        (load) =>
          load.villageName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          load.phoneNumber.includes(searchQuery)
      );
      setFilteredLoads(filtered);
    } else {
      setFilteredLoads(brickLoads);
    }
  }, [searchQuery, brickLoads]);

  const fetchBrickLoads = async () => {
    try {
      const { data, error } = await supabase
        .from("brick_loads")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const loadData = data.map((load) => ({
        id: load.id,
        villageName: load.village_name,
        phoneNumber: load.phone_number,
        brickQuantity: load.brick_quantity,
        brickRate: load.brick_rate,
        totalAmount: load.total_amount,
        amountPaid: load.amount_paid || 0,
        date: load.date,
        createdAt: load.created_at,
      }));

      setBrickLoads(loadData);
      setFilteredLoads(loadData);
    } catch (error) {
      console.error("Error fetching brick loads:", error);
    }
  };

  const fetchLoadLogs = async (loadId: string) => {
    try {
      const { data, error } = await supabase
        .from("brick_load_logs")
        .select("*")
        .eq("brick_load_id", loadId)
        .order("date", { ascending: false });

      if (error) throw error;

      const logsData = data.map((log) => ({
        id: log.id,
        brickLoadId: log.brick_load_id,
        date: log.date,
        logType: log.log_type,
        brickQuantity: log.brick_quantity,
        brickRate: log.brick_rate,
        amount: log.amount,
        createdAt: log.created_at,
      }));

      setLoadLogs(logsData);
    } catch (error) {
      console.error("Error fetching load logs:", error);
    }
  };

  const handleAddLoad = async () => {
    try {
      const brickQty = parseInt(brickQuantity) / 1000;
      const rate = parseFloat(brickRate);
      const paid = amountPaid ? parseFloat(amountPaid) : 0;
      const totalAmount = (parseInt(brickQuantity) * rate) / 1000;

      const { data: loadData, error: loadError } = await supabase
        .from("brick_loads")
        .insert([
          {
            date,
            village_name: villageName,
            phone_number: phoneNumber,
            brick_quantity: brickQty,
            brick_rate: rate,
            total_amount: totalAmount,
            amount_paid: paid,
          },
        ])
        .select()
        .single();

      if (loadError) throw loadError;

      await supabase.from("brick_load_logs").insert([
        {
          brick_load_id: loadData.id,
          date,
          log_type: "brick",
          brick_quantity: brickQty,
          brick_rate: rate,
          amount: totalAmount,
        },
      ]);

      if (paid > 0) {
        await supabase.from("brick_load_logs").insert([
          {
            brick_load_id: loadData.id,
            date,
            log_type: "payment",
            amount: paid,
          },
        ]);
      }

      resetForm();
      setShowAddModal(false);
      await fetchBrickLoads();
    } catch (error) {
      console.error("Error adding brick load:", error);
    }
  };

  const handleAddBrickLog = async () => {
    if (!selectedLoad) return;

    try {
      const brickQty = parseInt(newBrickQuantity) / 1000;
      const rate = parseFloat(newBrickRate);
      const totalAmount = (parseInt(newBrickQuantity) * rate) / 1000;

      await supabase.from("brick_load_logs").insert([
        {
          brick_load_id: selectedLoad.id,
          date: newBrickDate,
          log_type: "brick",
          brick_quantity: brickQty,
          brick_rate: rate,
          amount: totalAmount,
        },
      ]);

      const newTotal = selectedLoad.totalAmount + totalAmount;
      await supabase
        .from("brick_loads")
        .update({
          total_amount: newTotal,
          brick_quantity: selectedLoad.brickQuantity + brickQty,
        })
        .eq("id", selectedLoad.id);

      setNewBrickQuantity("");
      setNewBrickRate("");
      setShowBrickLogModal(false);
      await fetchBrickLoads();
      if (selectedLoad) {
        await fetchLoadLogs(selectedLoad.id);
        const updatedLoad = {
          ...selectedLoad,
          totalAmount: newTotal,
          brickQuantity: selectedLoad.brickQuantity + brickQty,
        };
        setSelectedLoad(updatedLoad);
      }
    } catch (error) {
      console.error("Error adding brick log:", error);
    }
  };

  const handleAddPayment = async () => {
    if (!selectedLoad) return;

    try {
      const payment = parseFloat(newPaymentAmount);

      await supabase.from("brick_load_logs").insert([
        {
          brick_load_id: selectedLoad.id,
          date: newPaymentDate,
          log_type: "payment",
          amount: payment,
        },
      ]);

      const newPaid = selectedLoad.amountPaid + payment;
      await supabase
        .from("brick_loads")
        .update({
          amount_paid: newPaid,
        })
        .eq("id", selectedLoad.id);

      setNewPaymentAmount("");
      setShowPaymentModal(false);
      await fetchBrickLoads();
      if (selectedLoad) {
        await fetchLoadLogs(selectedLoad.id);
        const updatedLoad = { ...selectedLoad, amountPaid: newPaid };
        setSelectedLoad(updatedLoad);
      }
    } catch (error) {
      console.error("Error adding payment:", error);
    }
  };

  const handleLoadSelect = (load: BrickLoad) => {
    setSelectedLoad(load);
    fetchLoadLogs(load.id);
  };

  const resetForm = () => {
    setDate(new Date().toISOString().split("T")[0]);
    setVillageName("");
    setPhoneNumber("");
    setBrickQuantity("");
    setBrickRate("");
    setAmountPaid("");
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getDate()}/${date.getMonth() + 1}/${date
      .getFullYear()
      .toString()
      .slice(-2)}`;
  };

  const formatNumber = (num: number): string => {
    return num.toLocaleString();
  };

  const calculateTotal = () => {
    if (!brickQuantity || !brickRate) return 0;
    return (parseInt(brickQuantity) * parseFloat(brickRate)) / 1000;
  };

  const calculatePending = (load: BrickLoad) => {
    return load.totalAmount - load.amountPaid;
  };

  const calculateLogTotals = () => {
    let brickTotal = 0;
    let paymentTotal = 0;

    loadLogs.forEach((log) => {
      if (log.logType === "brick") {
        brickTotal += log.amount;
      } else if (log.logType === "payment") {
        paymentTotal += log.amount;
      }
    });

    return { brickTotal, paymentTotal, balance: brickTotal - paymentTotal };
  };

  const handleDeleteLoad = async () => {
    if (!loadToDelete) return;

    try {
      await supabase
        .from("brick_load_logs")
        .delete()
        .eq("brick_load_id", loadToDelete);

      await supabase.from("brick_loads").delete().eq("id", loadToDelete);

      setLoadToDelete(null);
      setShowDeleteMode(false);
      setShowDeleteConfirmation(false);
      await fetchBrickLoads();
    } catch (error) {
      console.error("Error deleting brick load:", error);
    }
  };

  const handleDeleteLog = async () => {
    if (!logToDelete || !selectedLoad) return;

    try {
      const logToRemove = loadLogs.find((log) => log.id === logToDelete);
      if (!logToRemove) return;

      await supabase.from("brick_load_logs").delete().eq("id", logToDelete);

      // Update the brick load totals based on the deleted log
      let newTotalAmount = selectedLoad.totalAmount;
      let newBrickQuantity = selectedLoad.brickQuantity;
      let newAmountPaid = selectedLoad.amountPaid;

      if (logToRemove.logType === "brick") {
        newTotalAmount -= logToRemove.amount;
        newBrickQuantity -= logToRemove.brickQuantity || 0;

        await supabase
          .from("brick_loads")
          .update({
            total_amount: newTotalAmount,
            brick_quantity: newBrickQuantity,
          })
          .eq("id", selectedLoad.id);
      } else {
        newAmountPaid -= logToRemove.amount;

        await supabase
          .from("brick_loads")
          .update({
            amount_paid: newAmountPaid,
          })
          .eq("id", selectedLoad.id);
      }

      // Reset states and refresh data
      setLogToDelete(null);
      setShowDeleteLogMode(false);
      setShowDeleteLogConfirmation(false);

      await fetchBrickLoads();
      if (selectedLoad) {
        await fetchLoadLogs(selectedLoad.id);
        const updatedLoad = {
          ...selectedLoad,
          totalAmount: newTotalAmount,
          brickQuantity: newBrickQuantity,
          amountPaid: newAmountPaid,
        };
        setSelectedLoad(updatedLoad);
      }
    } catch (error) {
      console.error("Error deleting log:", error);
    }
  };

  // Function to generate WhatsApp message with load details
  const generateWhatsAppMessage = (load: BrickLoad) => {
    const pendingAmount = calculatePending(load);
    return encodeURIComponent(
      `JAI DURGA BRICKS\n\n` +
        `మొత్తం ఇటుక: ${formatNumber(
          Math.round(load.brickQuantity * 1000)
        )}\n` +
        `మొత్తం డబ్బులు: ₹${formatNumber(load.totalAmount)}\n` +
        `మీరు చెల్లించినవి: ₹${formatNumber(load.amountPaid)}\n` +
        `బాకీ: ₹${formatNumber(pendingAmount)}\n\n` +
        `Thank you for your business!`
    );
  };

  // Function to open WhatsApp with generated message
  const openWhatsApp = (e: React.MouseEvent, load: BrickLoad) => {
    e.stopPropagation(); // Prevent card click event
    const message = generateWhatsAppMessage(load);
    const phoneNumber = load.phoneNumber.replace(/\D/g, ""); // Remove non-digit characters
    window.open(`https://wa.me/91${phoneNumber}?text=${message}`, "_blank");
  };

  return (
    <div className="container mx-auto p-4">
      {!selectedLoad ? (
        <>
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">{t("brickLoad.title")}</h1>
          </div>

          <div className="flex flex-col mb-6">
            <div className="relative w-full mb-3">
              <input
                type="text"
                placeholder={t("brickLoad.search")}
                className="w-full px-4 py-2 pl-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => setShowAddModal(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white flex-1 text-xs py-1.5 px-2 h-auto"
              >
                <PlusIcon className="h-4 w-4 mr-1" /> {t("brickLoad.add")}
              </Button>
              <Button
                onClick={() => setShowDeleteMode(!showDeleteMode)}
                className={`${
                  showDeleteMode ? "bg-gray-600" : "bg-red-600 hover:bg-red-700"
                } text-white flex-1 text-xs py-1.5 px-2 h-auto`}
              >
                <TrashIcon className="h-4 w-4 mr-1" />{" "}
                {showDeleteMode ? "రద్దు" : "తొలగించు"}
              </Button>
            </div>
          </div>

          {showDeleteMode && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm mb-1">
                తొలగించడానికి ఇటుక లోడ్‌ని ఎంచుకోండి
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredLoads.map((load) => (
              <div
                key={load.id}
                className={`cursor-pointer hover:shadow-lg transition duration-200 ${
                  showDeleteMode && loadToDelete === load.id
                    ? "ring-2 ring-red-500 bg-red-50 rounded-lg"
                    : ""
                }`}
                onClick={() => {
                  if (showDeleteMode) {
                    setLoadToDelete(loadToDelete === load.id ? null : load.id);
                  } else {
                    handleLoadSelect(load);
                  }
                }}
              >
                <Card>
                  <CardContent className="p-4 relative">
                    {showDeleteMode && (
                      <div className="absolute top-2 right-2">
                        <div
                          className={`h-5 w-5 rounded-full border ${
                            loadToDelete === load.id
                              ? "bg-red-500 border-red-600"
                              : "border-gray-400"
                          }`}
                        >
                          {loadToDelete === load.id && (
                            <div className="flex items-center justify-center h-full">
                              <div className="h-2 w-2 bg-white rounded-full"></div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    <h3 className="text-lg font-semibold">
                      {load.villageName}
                    </h3>
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-gray-600">
                        {load.phoneNumber}
                      </p>
                      <button
                        className="text-green-600 hover:text-green-800 p-1"
                        onClick={(e) => openWhatsApp(e, load)}
                        title="Send details on WhatsApp"
                      >
                        <FaWhatsapp className="h-5 w-5" />
                      </button>
                    </div>
                    <div className="mt-2 flex justify-between">
                      <div>
                        <p className="text-sm">బకాయి మొత్తం:</p>
                        <p className="text-red-600 font-semibold">
                          ₹{formatNumber(calculatePending(load))}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm">మొత్తం:</p>
                        <p className="font-semibold">
                          ₹{formatNumber(load.totalAmount)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm">ఇటుకలు:</p>
                        <p className="font-semibold">
                          {formatNumber(Math.round(load.brickQuantity * 1000))}
                        </p>
                      </div>
                    </div>
                    <p className="mt-2 text-xs text-gray-500">
                      {formatDate(load.date)}
                    </p>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>

          {showDeleteMode && loadToDelete && (
            <div className="fixed bottom-4 right-4">
              <Button
                onClick={() => setShowDeleteConfirmation(true)}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                <TrashIcon className="h-5 w-5 mr-1" /> తొలగించడాన్ని
                నిర్ధారించండి
              </Button>
            </div>
          )}
        </>
      ) : (
        <div>
          <div className="flex items-center mb-6">
            <Button
              onClick={() => setSelectedLoad(null)}
              className="mr-4 bg-gray-200 hover:bg-gray-300 text-gray-800"
            >
              <ArrowLeftIcon className="h-5 w-5 mr-1" /> {t("common.back")}
            </Button>
            <h1 className="text-2xl font-bold">{selectedLoad.villageName}</h1>
            <p className="ml-4 text-gray-600">{selectedLoad.phoneNumber}</p>
            <button
              className="ml-3 text-green-600 hover:text-green-800 p-1"
              onClick={(e) => openWhatsApp(e, selectedLoad)}
              title="Send details on WhatsApp"
            >
              <FaWhatsapp className="h-6 w-6" />
            </button>
          </div>

          <div className="flex gap-4 mb-6">
            <Button
              onClick={() => setShowBrickLogModal(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              <PlusIcon className="h-5 w-5 mr-1" /> {t("brickLoad.addBrickLog")}
            </Button>
            <Button
              onClick={() => setShowPaymentModal(true)}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <PlusIcon className="h-5 w-5 mr-1" /> {t("brickLoad.addPayment")}
            </Button>
            <Button
              onClick={() => setShowDeleteLogMode(!showDeleteLogMode)}
              className={`${
                showDeleteLogMode
                  ? "bg-gray-600"
                  : "bg-red-600 hover:bg-red-700"
              } text-white`}
            >
              <TrashIcon className="h-5 w-5 mr-1" />{" "}
              {showDeleteLogMode ? "రద్దు" : "లాగ్ తొలగించు"}
            </Button>
          </div>

          {showDeleteLogMode && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm mb-1">
                తొలగించడానికి లాగ్‌ని ఎంచుకోండి
              </p>
            </div>
          )}

          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <h3 className="text-sm text-gray-500">మొత్తం ఇటుకలు</h3>
                  <p className="text-lg font-semibold">
                    {formatNumber(
                      Math.round(selectedLoad.brickQuantity * 1000)
                    )}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm text-gray-500">మొత్తం</h3>
                  <p className="text-lg font-semibold">
                    ₹{formatNumber(selectedLoad.totalAmount)}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm text-gray-500">చెల్లించారు</h3>
                  <p className="text-lg font-semibold text-green-600">
                    ₹{formatNumber(selectedLoad.amountPaid)}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm text-gray-500">బకాయి</h3>
                  <p className="text-lg font-semibold text-red-600">
                    ₹{formatNumber(calculatePending(selectedLoad))}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <h2 className="text-xl font-bold mb-4">లాగ్‌లు</h2>

          {loadLogs.map((log) => (
            <div
              key={log.id}
              onClick={() => {
                if (showDeleteLogMode) {
                  setLogToDelete(logToDelete === log.id ? null : log.id);
                }
              }}
              className={`cursor-pointer ${
                showDeleteLogMode && logToDelete === log.id
                  ? "ring-2 ring-red-500 bg-red-50 rounded-lg"
                  : ""
              }`}
            >
              <Card className="mb-4">
                <CardContent className="p-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between">
                    <div className="w-full md:w-auto mb-3 md:mb-0 flex items-center">
                      {showDeleteLogMode && (
                        <div className="mr-2">
                          <div
                            className={`h-5 w-5 rounded-full border ${
                              logToDelete === log.id
                                ? "bg-red-500 border-red-600"
                                : "border-gray-400"
                            }`}
                          >
                            {logToDelete === log.id && (
                              <div className="flex items-center justify-center h-full">
                                <div className="h-2 w-2 bg-white rounded-full"></div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      <div
                        className={`w-2 h-14 rounded-full mr-4 ${
                          log.logType === "brick"
                            ? "bg-red-500"
                            : "bg-green-500"
                        }`}
                      ></div>
                      <div>
                        <p className="text-sm text-gray-500 font-medium">
                          {formatDate(log.date)}
                        </p>
                        <span
                          className={`inline-block px-2 py-0.5 text-xs rounded-full mt-1 ${
                            log.logType === "brick"
                              ? "bg-red-100 text-red-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {log.logType === "brick" ? "ఇటుకలు" : "చెల్లింపు"}
                        </span>
                      </div>
                    </div>

                    {log.logType === "brick" ? (
                      <div className="flex flex-wrap md:flex-nowrap mt-2 md:mt-0">
                        <div className="w-1/2 md:w-auto md:mr-8">
                          <p className="text-xs text-gray-500">ఇటుకలు</p>
                          <p className="text-base font-semibold">
                            {formatNumber(
                              Math.round(log.brickQuantity! * 1000)
                            )}
                          </p>
                        </div>
                        <div className="w-1/2 md:w-auto md:mr-8">
                          <p className="text-xs text-gray-500">రేటు</p>
                          <p className="text-base font-semibold">
                            ₹{formatNumber(log.brickRate!)} / 1000
                          </p>
                        </div>
                        <div className="w-full md:w-auto mt-2 md:mt-0">
                          <p className="text-xs text-gray-500">మొత్తం</p>
                          <p className="text-base font-semibold text-red-600">
                            ₹{formatNumber(log.amount)}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-2 md:mt-0">
                        <p className="text-xs text-gray-500">
                          చెల్లింపు మొత్తం
                        </p>
                        <p className="text-base font-semibold text-green-600">
                          ₹{formatNumber(log.amount)}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}

          {showDeleteLogMode && logToDelete && (
            <div className="fixed bottom-4 right-4">
              <Button
                onClick={() => setShowDeleteLogConfirmation(true)}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                <TrashIcon className="h-5 w-5 mr-1" /> తొలగించడాన్ని
                నిర్ధారించండి
              </Button>
            </div>
          )}

          <Card className="mt-6">
            <CardContent className="p-4">
              <h3 className="text-lg font-semibold mb-4">సారాంశం</h3>
              {(() => {
                const { brickTotal, paymentTotal, balance } =
                  calculateLogTotals();
                return (
                  <div className="flex flex-wrap">
                    <div className="w-full md:w-auto md:flex-1 p-3 border-r border-gray-200">
                      <p className="text-sm text-gray-500">తేదీ</p>
                      <p className="text-lg font-semibold">
                        {formatDate(selectedLoad.date)}
                      </p>
                    </div>
                    <div className="w-full md:w-auto md:flex-1 p-3 border-r border-gray-200">
                      <p className="text-sm text-gray-500">ఇటుకలు</p>
                      <p className="text-lg font-semibold">
                        {formatNumber(
                          Math.round(selectedLoad.brickQuantity * 1000)
                        )}
                      </p>
                    </div>
                    <div className="w-full md:w-auto md:flex-1 p-3 border-r border-gray-200">
                      <p className="text-sm text-gray-500">మొత్తం ఇటుకలు</p>
                      <p className="text-lg font-semibold text-red-600">
                        ₹{formatNumber(brickTotal)}
                      </p>
                    </div>
                    <div className="w-full md:w-auto md:flex-1 p-3 border-r border-gray-200">
                      <p className="text-sm text-gray-500">
                        మొత్తం చెల్లింపులు
                      </p>
                      <p className="text-lg font-semibold text-green-600">
                        ₹{formatNumber(paymentTotal)}
                      </p>
                    </div>
                    <div className="w-full md:w-auto md:flex-1 p-3">
                      <p className="text-sm text-gray-500">బకాయి</p>
                      <p className="text-lg font-semibold text-red-600">
                        ₹{formatNumber(balance)}
                      </p>
                    </div>
                  </div>
                );
              })()}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Add Load Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-indigo-600/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white/95 backdrop-blur-sm rounded-lg p-6 w-full max-w-md shadow-xl">
            <h2 className="text-xl font-bold mb-4">లోడ్ వివరాలు జోడించండి</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  తేదీ
                </label>
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  గ్రామం పేరు
                </label>
                <Input
                  type="text"
                  value={villageName}
                  onChange={(e) => setVillageName(e.target.value)}
                  required
                  placeholder="గ్రామం పేరు"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ఫోన్ నంబర్
                </label>
                <Input
                  type="text"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="ఫోన్ నంబర్"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ఇటుకల సంఖ్య
                </label>
                <Input
                  type="number"
                  value={brickQuantity}
                  onChange={(e) => setBrickQuantity(e.target.value)}
                  required
                  placeholder="ఇటుకల మొత్తం సంఖ్య - ఉదా: 5500"
                  step="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ఇటుక రేటు (1000 కి)
                </label>
                <Input
                  type="number"
                  value={brickRate}
                  onChange={(e) => setBrickRate(e.target.value)}
                  required
                  placeholder="ఒక్కో 1000 ఇటుకలకు ధర"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  మొత్తం
                </label>
                <p className="text-lg font-semibold">
                  ₹{formatNumber(calculateTotal())}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  అతను ఇచ్చిన డబ్బు (ఐచ్ఛికం)
                </label>
                <Input
                  type="number"
                  value={amountPaid}
                  onChange={(e) => setAmountPaid(e.target.value)}
                  placeholder="ముందుగా చెల్లించిన మొత్తం"
                  step="0.01"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <Button
                onClick={() => setShowAddModal(false)}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800"
              >
                రద్దు చేయండి
              </Button>
              <Button
                onClick={handleAddLoad}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                సేవ్ చేయండి
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Add Brick Log Modal */}
      {showBrickLogModal && (
        <div className="fixed inset-0 bg-indigo-600/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white/95 backdrop-blur-sm rounded-lg p-6 w-full max-w-md shadow-xl">
            <h2 className="text-xl font-bold mb-4">
              కొత్త ఇటుకల లాగ్ జోడించండి
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  తేదీ
                </label>
                <Input
                  type="date"
                  value={newBrickDate}
                  onChange={(e) => setNewBrickDate(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ఇటుకల సంఖ్య
                </label>
                <Input
                  type="number"
                  value={newBrickQuantity}
                  onChange={(e) => setNewBrickQuantity(e.target.value)}
                  required
                  placeholder="ఇటుకల మొత్తం సంఖ్య - ఉదా: 5500"
                  step="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ఇటుక రేటు (1000 కి)
                </label>
                <Input
                  type="number"
                  value={newBrickRate}
                  onChange={(e) => setNewBrickRate(e.target.value)}
                  required
                  placeholder="ఒక్కో 1000 ఇటుకలకు ధర"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  మొత్తం
                </label>
                <p className="text-lg font-semibold">
                  ₹
                  {newBrickQuantity && newBrickRate
                    ? formatNumber(
                        (parseInt(newBrickQuantity) *
                          parseFloat(newBrickRate)) /
                          1000
                      )
                    : "0.00"}
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <Button
                onClick={() => setShowBrickLogModal(false)}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800"
              >
                రద్దు చేయండి
              </Button>
              <Button
                onClick={handleAddBrickLog}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                సేవ్ చేయండి
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Add Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-indigo-600/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white/95 backdrop-blur-sm rounded-lg p-6 w-full max-w-md shadow-xl">
            <h2 className="text-xl font-bold mb-4">
              కొత్త చెల్లింపు జోడించండి
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  తేదీ
                </label>
                <Input
                  type="date"
                  value={newPaymentDate}
                  onChange={(e) => setNewPaymentDate(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  చెల్లించిన మొత్తం
                </label>
                <Input
                  type="number"
                  value={newPaymentAmount}
                  onChange={(e) => setNewPaymentAmount(e.target.value)}
                  required
                  placeholder="చెల్లించిన మొత్తం"
                  step="0.01"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <Button
                onClick={() => setShowPaymentModal(false)}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800"
              >
                రద్దు చేయండి
              </Button>
              <Button
                onClick={handleAddPayment}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                సేవ్ చేయండి
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirmation && (
        <div className="fixed inset-0 bg-red-600/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white/95 backdrop-blur-sm rounded-lg p-6 w-full max-w-md shadow-xl">
            <div className="flex items-center mb-4 text-red-600">
              <ExclamationTriangleIcon className="h-6 w-6 mr-2" />
              <h2 className="text-xl font-bold">తొలగించడాన్ని నిర్ధారించండి</h2>
            </div>

            <p className="mb-6 text-gray-700">
              ఈ ఇటుక లోడ్‌ని తొలగించాలని మీరు ఖచ్చితంగా అనుకుంటున్నారా? ఈ చర్య
              మార్పిడి చేయబడదు మరియు అన్ని సంబంధిత డేటా కూడా తొలగించబడుతుంది.
            </p>

            <div className="flex justify-end gap-2">
              <Button
                onClick={() => {
                  setShowDeleteConfirmation(false);
                  setLoadToDelete(null);
                }}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800"
              >
                రద్దు చేయండి
              </Button>
              <Button
                onClick={handleDeleteLoad}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                తొలగించు
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Log Confirmation Modal */}
      {showDeleteLogConfirmation && (
        <div className="fixed inset-0 bg-red-600/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white/95 backdrop-blur-sm rounded-lg p-6 w-full max-w-md shadow-xl">
            <div className="flex items-center mb-4 text-red-600">
              <ExclamationTriangleIcon className="h-6 w-6 mr-2" />
              <h2 className="text-xl font-bold">
                లాగ్ తొలగించడాన్ని నిర్ధారించండి
              </h2>
            </div>

            <p className="mb-6 text-gray-700">
              ఈ లాగ్‌ని తొలగించాలని మీరు ఖచ్చితంగా అనుకుంటున్నారా? ఈ చర్య
              మార్పిడి చేయబడదు మరియు మొత్తాలు తగ్గిస్తాయి.
            </p>

            <div className="flex justify-end gap-2">
              <Button
                onClick={() => {
                  setShowDeleteLogConfirmation(false);
                  setLogToDelete(null);
                }}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800"
              >
                రద్దు చేయండి
              </Button>
              <Button
                onClick={handleDeleteLog}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                తొలగించు
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default withAuth(BrickLoadDetail);
