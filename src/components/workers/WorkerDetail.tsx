"use client";

import { useState, useEffect } from "react";
import * as React from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Tabs, TabItem } from "@/components/ui/Tabs";
import { useLanguage } from "@/utils/i18n";
import {
  Worker,
  WorkRecord,
  UsageRecord,
  WorkType,
  workTypeDefaults,
} from "@/types";
import { Input } from "@/components/ui/Input";
import { Select, SelectOption } from "@/components/ui/Select";
import { Checkbox } from "@/components/ui/Checkbox";
import { RadioGroup, RadioOption } from "@/components/ui/RadioGroup";
import {
  ArrowLeftIcon,
  PlusIcon,
  TrashIcon,
  XMarkIcon,
  FunnelIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  getWorkerById,
  getWorkRecords,
  getUsageRecords,
  createWorkRecord,
  createUsageRecord,
  deleteWorker,
  deleteWorkRecord,
  deleteUsageRecord,
} from "@/utils/supabase";
import withAuth from "@/contexts/withAuth";

interface WorkerDetailProps {
  workerId: string;
  onBack?: () => void;
  standalone?: boolean;
}

function WorkerDetail({
  workerId,
  onBack,
  standalone = false,
}: WorkerDetailProps) {
  const router = useRouter();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState("thisWeek");
  const [worker, setWorker] = useState<Worker | null>(null);
  const [workRecords, setWorkRecords] = useState<WorkRecord[]>([]);
  const [filteredWorkRecords, setFilteredWorkRecords] = useState<WorkRecord[]>(
    []
  );
  const [usageRecords, setUsageRecords] = useState<UsageRecord[]>([]);
  const [filteredUsageRecords, setFilteredUsageRecords] = useState<
    UsageRecord[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);

  // State for modals and filters
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<{
    id: string;
    type: "work" | "usage" | "worker";
  } | null>(null);
  const [showUsageModal, setShowUsageModal] = useState(false);
  const [usageAmount, setUsageAmount] = useState("");
  const [usageDate, setUsageDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [showWorkModal, setShowWorkModal] = useState(false);
  const [workDate, setWorkDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [workType, setWorkType] = useState<WorkType>("kundi");
  const [workAmount, setWorkAmount] = useState(workTypeDefaults.kundi.amount);
  const [isDriver, setIsDriver] = useState(false);
  const [brickCount, setBrickCount] = useState(1000);
  const [dayType, setDayType] = useState("full");
  const [kundiType, setKundiType] = useState<string>("work");

  // Filter states
  const [showFilters, setShowFilters] = useState(false);
  const [dateFilter, setDateFilter] = useState("");
  const [workTypeFilter, setWorkTypeFilter] = useState<string>("");

  // Define tabs based on translations
  const localizedTabs: TabItem[] = [
    { id: "thisWeek", label: t("tab.thisWeek") || "This Week Work" },
    { id: "totalWork", label: t("tab.totalWork") || "Total Work" },
  ];

  // Work type options for select
  const workTypeOptions: SelectOption[] = [
    { value: "kundi", label: t("work.kundi") },
    { value: "brickCarry", label: t("work.brickCarry") },
    { value: "brickBaking", label: t("work.brickBaking") },
    { value: "brickLoadTractor", label: t("work.brickLoadTractor") },
    { value: "brickLoadVan", label: t("work.brickLoadVan") },
    { value: "topWork", label: t("work.topWork") },
  ];

  // Filter options for work type
  const filterWorkTypeOptions: SelectOption[] = [
    { value: "", label: t("common.all") || "All" },
    ...workTypeOptions,
    { value: "usage", label: t("tab.usage") },
  ];

  // Day type options for radio group
  const dayTypeOptions: RadioOption[] = [
    { value: "full", label: t("common.fullDay") },
    { value: "half", label: t("common.halfDay") },
  ];

  // Kundi type options
  const kundiTypeOptions: RadioOption[] = [
    { value: "work", label: t("common.work") || "పని" },
    { value: "driver", label: t("common.driver") },
  ];

  // Load data from Supabase
  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        // Load the worker from Supabase
        const foundWorker = await getWorkerById(workerId);
        setWorker(foundWorker);

        // Load work records from Supabase
        const workerRecords = await getWorkRecords(workerId);
        setWorkRecords(workerRecords);

        // Load usage records from Supabase
        const workerUsageRecords = await getUsageRecords(workerId);
        setUsageRecords(workerUsageRecords);
      } catch (error) {
        console.error("Error loading worker data:", error);
      } finally {
        // Finish loading
        setIsLoading(false);
      }
    }

    fetchData();
  }, [workerId]);

  // Check for localStorage values to automatically open usage modal
  useEffect(() => {
    if (!isLoading && worker) {
      const shouldOpenModal = localStorage.getItem("openUsageModal");
      const prefilledAmount = localStorage.getItem("prefilledAmount");

      if (shouldOpenModal === "true" && prefilledAmount) {
        setUsageAmount(prefilledAmount);
        setShowUsageModal(true);

        // Clear localStorage values
        localStorage.removeItem("openUsageModal");
        localStorage.removeItem("prefilledAmount");
      }
    }
  }, [isLoading, worker]);

  // Apply filters to records
  useEffect(() => {
    // Filter work records
    let filteredWork = [...workRecords];

    if (dateFilter) {
      filteredWork = filteredWork.filter(
        (record) => record.date === dateFilter
      );
    }

    if (workTypeFilter && workTypeFilter !== "usage") {
      filteredWork = filteredWork.filter(
        (record) => record.workType === workTypeFilter
      );
    }

    setFilteredWorkRecords(filteredWork);

    // Filter usage records
    let filteredUsage = [...usageRecords];

    if (dateFilter) {
      filteredUsage = filteredUsage.filter(
        (record) => record.date === dateFilter
      );
    }

    // If work type filter is set to "usage", only show usage records
    // Otherwise, if any other work type is selected, don't show usage records
    if (workTypeFilter) {
      if (workTypeFilter !== "usage") {
        filteredUsage = [];
      }
    }

    setFilteredUsageRecords(filteredUsage);
  }, [workRecords, usageRecords, dateFilter, workTypeFilter]);

  // Update amount based on work type
  useEffect(() => {
    if (!showWorkModal) return;

    const defaultConfig = workTypeDefaults[workType];

    if (workType === "kundi") {
      // Set based on kundi type
      setWorkAmount(kundiType === "driver" ? 500 : 400);
    } else if (workType === "brickCarry") {
      // Calculate based on brick count
      const perThousandRate = defaultConfig.amount;
      setWorkAmount(Math.floor((brickCount / 1000) * perThousandRate));
    } else if (workType === "brickLoadTractor") {
      // Set amount based on driver status
      setWorkAmount(isDriver ? 500 : 250);
    } else if (workType === "brickLoadVan") {
      // Set amount based on driver status
      setWorkAmount(isDriver ? 600 : 300);
    } else if (workType === "topWork") {
      // Set based on day type
      setWorkAmount(
        dayType === "half" ? defaultConfig.amount / 2 : defaultConfig.amount
      );
    } else {
      // Use default amount
      setWorkAmount(defaultConfig.amount);
    }
  }, [workType, brickCount, dayType, kundiType, isDriver, showWorkModal]);

  // Reset filters
  const resetFilters = () => {
    setDateFilter("");
    setWorkTypeFilter("");
  };

  // Handle record deletion
  const handleDeleteClick = (id: string, type: "work" | "usage" | "worker") => {
    setRecordToDelete({ id, type });
    setShowDeleteModal(true);
  };

  // Confirm and delete the record
  const confirmDelete = async () => {
    if (!recordToDelete) return;

    try {
      if (recordToDelete.type === "work") {
        // Delete work record from Supabase
        await deleteWorkRecord(recordToDelete.id);
        // Update local state
        setWorkRecords(
          workRecords.filter((record) => record.id !== recordToDelete.id)
        );
      } else if (recordToDelete.type === "usage") {
        // Delete usage record from Supabase
        await deleteUsageRecord(recordToDelete.id);
        // Update local state
        setUsageRecords(
          usageRecords.filter((record) => record.id !== recordToDelete.id)
        );
      } else if (recordToDelete.type === "worker") {
        // Delete worker from Supabase
        await deleteWorker(workerId);
        if (onBack) {
          onBack();
        } else if (standalone) {
          router.push("/");
        }
      }
    } catch (error) {
      console.error("Error deleting record:", error);
    } finally {
      setShowDeleteModal(false);
      setRecordToDelete(null);
    }
  };

  // Cancel deletion
  const cancelDelete = () => {
    setShowDeleteModal(false);
    setRecordToDelete(null);
  };

  // Calculate total amount
  const calculateTotal = (records: WorkRecord[]) => {
    return records.reduce((total, record) => total + record.amount, 0);
  };

  // Merge and sort work and usage records by date (oldest first)
  const mergeAndSortRecords = (
    workRecords: WorkRecord[],
    usageRecords: UsageRecord[]
  ) => {
    // Create a combined array with a type field to differentiate records
    const combined = [
      ...workRecords.map((record) => ({
        ...record,
        recordType: "work" as const,
      })),
      ...usageRecords.map((record) => ({
        ...record,
        recordType: "usage" as const,
      })),
    ];

    // Sort by date (oldest first)
    return combined.sort((a, b) => {
      // Convert to Date objects for comparison
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateA.getTime() - dateB.getTime();
    });
  };

  // Format date from YYYY-MM-DD to DD/MM/YY
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

  // Helper to get work type label
  const getWorkTypeLabel = (workType: string) => {
    return t(`work.${workType}`);
  };

  // Add new usage record
  const handleAddUsage = async () => {
    if (!usageAmount) return;

    try {
      // Create usage record in Supabase
      const usageRecord = await createUsageRecord({
        workerId: workerId,
        date: usageDate,
        amount: Number(usageAmount),
      });

      // Update local state
      setUsageRecords([usageRecord, ...usageRecords]);

      // Reset form
      setUsageAmount("");
      setUsageDate(new Date().toISOString().split("T")[0]);

      // Close modal
      setShowUsageModal(false);
    } catch (error) {
      console.error("Error adding usage:", error);
    }
  };

  // Add new work record
  const handleAddWork = async () => {
    try {
      // Create work record in Supabase
      const workRecord = await createWorkRecord({
        workerId: workerId,
        workType,
        date: workDate,
        amount: workAmount,
        isDriver:
          workType === "kundi"
            ? kundiType === "driver"
            : ["brickLoadTractor", "brickLoadVan"].includes(workType)
            ? isDriver
            : undefined,
        brickCount: workType === "brickCarry" ? brickCount : undefined,
        isHalfDay: workType === "topWork" ? dayType === "half" : undefined,
      });

      // Update local state
      setWorkRecords([workRecord, ...workRecords]);

      // Reset form
      setWorkDate(new Date().toISOString().split("T")[0]);
      setWorkType("kundi");
      setWorkAmount(kundiType === "driver" ? 500 : 400);
      setKundiType("work");
      setIsDriver(false);
      setBrickCount(1000);
      setDayType("full");

      // Close modal
      setShowWorkModal(false);
    } catch (error) {
      console.error("Error adding work:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!worker) {
    return (
      <div className="text-center py-10">
        <p className="text-red-600 mb-4">{t("error.workerNotFound")}</p>
        {standalone ? (
          <Link href="/">
            <Button>{t("nav.workers")}</Button>
          </Link>
        ) : (
          onBack && <Button onClick={onBack}>{t("nav.workers")}</Button>
        )}
      </div>
    );
  }

  return (
    <div>
      {/* Back button - Only show if not rendered from Home page */}
      {standalone && (
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center text-indigo-600 hover:text-indigo-800"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-1" />
            {t("nav.workers")}
          </Link>
        </div>
      )}

      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <div>
              <h1 className="text-xl font-bold text-indigo-900">
                {worker.name}
              </h1>
              <p className="text-gray-800 text-sm">{worker.phone}</p>
              {worker.initialDebt && (
                <p className="text-red-600 text-sm">
                  {t("worker.debt")}: ₹{formatNumber(worker.initialDebt)}
                </p>
              )}
            </div>
            <div className="mt-3 sm:mt-0 flex flex-wrap gap-2">
              <Button
                className="flex items-center text-sm py-1 px-2 h-auto"
                onClick={() => setShowWorkModal(true)}
              >
                <PlusIcon className="h-3 w-3 mr-1" />
                {t("tab.addTodayWork")}
              </Button>
              <Button
                className="flex items-center text-sm py-1 px-2 h-auto"
                onClick={() => setShowUsageModal(true)}
              >
                <PlusIcon className="h-3 w-3 mr-1" />
                {t("tab.addUsage")}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Tabs
            items={localizedTabs}
            defaultTab={activeTab}
            onChange={setActiveTab}
            className="px-4 pt-4"
          />

          <div className="p-4">
            {/* Filter Controls */}
            <div className="mb-4">
              <Button
                variant="outline"
                className="flex items-center mb-2"
                onClick={() => setShowFilters(!showFilters)}
              >
                <FunnelIcon className="h-4 w-4 mr-2" />
                {showFilters
                  ? t("common.hideFilters") || "Hide Filters"
                  : t("common.showFilters") || "Show Filters"}
              </Button>

              {showFilters && (
                <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-800 mb-1">
                        {t("common.date")}
                      </label>
                      <Input
                        type="date"
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value)}
                        className="text-gray-900"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-800 mb-1">
                        {t("common.workType")}
                      </label>
                      <Select
                        options={filterWorkTypeOptions}
                        value={workTypeFilter}
                        onChange={(e) => setWorkTypeFilter(e.target.value)}
                        className="text-gray-900"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button variant="outline" size="sm" onClick={resetFilters}>
                      {t("common.resetFilters") || "Reset Filters"}
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {activeTab === "thisWeek" && (
              <div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 table-fixed">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-2 py-2 text-left text-xs font-medium text-gray-800 uppercase tracking-wider w-20">
                          {t("common.date")}
                        </th>
                        <th className="px-2 py-2 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">
                          {t("common.workType")}
                        </th>
                        <th className="px-2 py-2 text-right text-xs font-medium text-gray-800 uppercase tracking-wider w-16">
                          {t("common.amount")}
                        </th>
                        <th className="px-2 py-2 text-right text-xs font-medium text-gray-800 uppercase tracking-wider w-12">
                          {t("common.actions")}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {mergeAndSortRecords(
                        filteredWorkRecords,
                        filteredUsageRecords
                      ).map((record) => (
                        <tr
                          key={record.id}
                          className={
                            record.recordType === "work"
                              ? "bg-green-50 hover:bg-green-100"
                              : "bg-red-50 hover:bg-red-100"
                          }
                        >
                          <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-800">
                            {formatDate(record.date)}
                          </td>
                          <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-800">
                            {record.recordType === "work" ? (
                              <span className="text-green-800">
                                {getWorkTypeLabel(record.workType)}
                                {record.isDriver && record.workType === "kundi"
                                  ? ` - ${t("common.driver")}`
                                  : record.workType !== "kundi" &&
                                    record.isDriver &&
                                    ` - ${t("common.driver")}`}
                                {record.brickCount && ` (${record.brickCount})`}
                                {record.isHalfDay &&
                                  ` - ${t("common.halfDay")}`}
                              </span>
                            ) : (
                              <span className="text-red-600">
                                {t("tab.usage")}
                              </span>
                            )}
                          </td>
                          <td className="px-2 py-2 whitespace-nowrap text-base text-right font-medium">
                            {record.recordType === "work" ? (
                              <span className="text-green-700">
                                ₹{formatNumber(record.amount)}
                              </span>
                            ) : (
                              <span className="text-red-600">
                                -₹{formatNumber(record.amount)}
                              </span>
                            )}
                          </td>
                          <td className="px-2 py-2 whitespace-nowrap text-right">
                            <button
                              onClick={() =>
                                handleDeleteClick(record.id, record.recordType)
                              }
                              className="text-red-600 hover:text-red-800"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50">
                      <tr>
                        <td
                          colSpan={2}
                          className="px-2 py-2 text-right text-sm font-medium text-gray-800"
                        >
                          {t("common.total")}:
                        </td>
                        <td
                          className="px-2 py-2 text-right text-base font-bold text-gray-900 cursor-pointer hover:text-indigo-700"
                          onClick={() => {
                            const totalBalance =
                              calculateTotal(filteredWorkRecords) -
                              filteredUsageRecords.reduce(
                                (total, record) => total + record.amount,
                                0
                              );
                            setUsageAmount(Math.abs(totalBalance).toString());
                            setShowUsageModal(true);
                          }}
                          title={t("tab.addUsage")}
                        >
                          ₹
                          {formatNumber(
                            calculateTotal(filteredWorkRecords) -
                              filteredUsageRecords.reduce(
                                (total, record) => total + record.amount,
                                0
                              )
                          )}
                        </td>
                        <td></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            )}

            {activeTab === "totalWork" && (
              <div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 table-fixed">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-2 py-2 text-left text-xs font-medium text-gray-800 uppercase tracking-wider w-20">
                          {t("common.date")}
                        </th>
                        <th className="px-2 py-2 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">
                          {t("common.workType")}
                        </th>
                        <th className="px-2 py-2 text-right text-xs font-medium text-gray-800 uppercase tracking-wider w-20">
                          {t("common.amount")}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {mergeAndSortRecords(
                        filteredWorkRecords,
                        filteredUsageRecords
                      ).map((record) => (
                        <tr
                          key={record.id}
                          className={
                            record.recordType === "work"
                              ? "bg-green-50 hover:bg-green-100"
                              : "bg-red-50 hover:bg-red-100"
                          }
                        >
                          <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-800">
                            {formatDate(record.date)}
                          </td>
                          <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-800">
                            {record.recordType === "work" ? (
                              <span className="text-green-800">
                                {getWorkTypeLabel(record.workType)}
                                {record.isDriver && record.workType === "kundi"
                                  ? ` - ${t("common.driver")}`
                                  : record.workType !== "kundi" &&
                                    record.isDriver &&
                                    ` - ${t("common.driver")}`}
                                {record.brickCount && ` (${record.brickCount})`}
                                {record.isHalfDay &&
                                  ` - ${t("common.halfDay")}`}
                              </span>
                            ) : (
                              <span className="text-red-600">
                                {t("tab.usage")}
                              </span>
                            )}
                          </td>
                          <td className="px-2 py-2 whitespace-nowrap text-base text-right font-medium">
                            {record.recordType === "work" ? (
                              <span className="text-green-700">
                                ₹{formatNumber(record.amount)}
                              </span>
                            ) : (
                              <span className="text-red-600">
                                -₹{formatNumber(record.amount)}
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50">
                      <tr>
                        <td
                          colSpan={2}
                          className="px-2 py-2 text-right text-sm font-medium text-gray-800"
                        >
                          {t("common.total")}:
                        </td>
                        <td className="px-2 py-2 text-right text-base font-bold text-gray-900">
                          ₹
                          {formatNumber(
                            calculateTotal(filteredWorkRecords) -
                              filteredUsageRecords.reduce(
                                (total, record) => total + record.amount,
                                0
                              )
                          )}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Work Modal */}
      {showWorkModal && (
        <div className="fixed inset-0 backdrop-blur-sm bg-indigo-800/30 flex items-center justify-center z-50 transition-all duration-300">
          <div className="bg-white/95 p-6 rounded-xl shadow-2xl max-w-md w-full border border-indigo-100">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">
                {t("tab.addTodayWork")}
              </h3>
              <button
                onClick={() => setShowWorkModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="mb-4">
              <Input
                label={t("common.date")}
                type="date"
                value={workDate}
                onChange={(e) => setWorkDate(e.target.value)}
                className="text-gray-900 font-medium"
                max={new Date().toISOString().split("T")[0]}
              />
            </div>

            <div className="mb-4">
              <Select
                label={t("common.workType")}
                options={workTypeOptions}
                value={workType}
                onChange={(e) => setWorkType(e.target.value as WorkType)}
                required
                className="text-gray-900 font-medium"
              />
            </div>

            {workType === "kundi" && (
              <div className="mb-4">
                <RadioGroup
                  label={t("work.kundiOptions") || "కుండీ రకం"}
                  name="kundiType"
                  options={kundiTypeOptions}
                  value={kundiType}
                  onChange={(e) => setKundiType(e.target.value)}
                />
              </div>
            )}

            {workType === "brickCarry" && (
              <div className="mb-4">
                <Input
                  type="number"
                  label={t("common.brickCount")}
                  value={brickCount}
                  onChange={(e) => setBrickCount(Number(e.target.value))}
                  min={1}
                  required
                  className="text-gray-900 font-medium"
                />
              </div>
            )}

            {["brickLoadTractor", "brickLoadVan"].includes(workType) && (
              <div className="mb-4">
                <Checkbox
                  label={t("common.driver")}
                  checked={isDriver}
                  onChange={(e) => setIsDriver(e.target.checked)}
                />
              </div>
            )}

            {workType === "topWork" && (
              <div className="mb-4">
                <RadioGroup
                  label={t("common.workType")}
                  name="dayType"
                  options={dayTypeOptions}
                  value={dayType}
                  onChange={(e) => setDayType(e.target.value)}
                />
              </div>
            )}

            <div className="mb-6">
              <Input
                label={t("common.amount")}
                type="number"
                value={workAmount}
                onChange={(e) => setWorkAmount(Number(e.target.value))}
                min={1}
                required
                className="text-gray-900 font-medium"
              />
            </div>

            <div className="flex justify-end space-x-4">
              <Button variant="outline" onClick={() => setShowWorkModal(false)}>
                {t("common.cancel")}
              </Button>
              <Button onClick={handleAddWork}>{t("common.save")}</Button>
            </div>
          </div>
        </div>
      )}

      {/* Usage Modal */}
      {showUsageModal && (
        <div className="fixed inset-0 backdrop-blur-sm bg-indigo-800/30 flex items-center justify-center z-50 transition-all duration-300">
          <div className="bg-white/95 p-6 rounded-xl shadow-2xl max-w-md w-full border border-indigo-100">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">
                {t("tab.addUsage")}
              </h3>
              <button
                onClick={() => setShowUsageModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="mb-4">
              <Input
                label={t("common.date")}
                type="date"
                value={usageDate}
                onChange={(e) => setUsageDate(e.target.value)}
                className="text-gray-900 font-medium"
              />
            </div>

            <div className="mb-6">
              <Input
                label={t("common.amount")}
                type="number"
                placeholder="0"
                value={usageAmount}
                onChange={(e) => setUsageAmount(e.target.value)}
                className="text-gray-900 font-medium"
              />
            </div>

            <div className="flex justify-end space-x-4">
              <Button
                variant="outline"
                onClick={() => setShowUsageModal(false)}
              >
                {t("common.cancel")}
              </Button>
              <Button onClick={handleAddUsage}>{t("common.save")}</Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-red-600/20 backdrop-blur-sm flex items-center justify-center z-50 transition-all duration-300">
          <div className="bg-white/95 backdrop-blur-sm rounded-lg p-6 max-w-md w-full shadow-xl">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              {t("common.confirmDelete")}
            </h3>
            <p className="mb-6 text-gray-700">
              {recordToDelete?.type === "worker"
                ? t("common.confirmDeleteWorker")
                : recordToDelete?.type === "work"
                ? t("common.confirmDeleteWork")
                : t("common.confirmDeleteUsage")}
            </p>
            <div className="flex justify-end space-x-4">
              <Button variant="outline" onClick={cancelDelete}>
                {t("common.cancel")}
              </Button>
              <Button variant="danger" onClick={confirmDelete}>
                {t("common.delete")}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default withAuth(WorkerDetail);
