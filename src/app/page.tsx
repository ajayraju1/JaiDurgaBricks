"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useLanguage } from "@/utils/i18n";
import { Worker } from "@/types";
import {
  UserPlusIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  TrashIcon,
  ArrowLeftIcon,
  UserMinusIcon,
} from "@heroicons/react/24/outline";
import {
  getWorkers,
  createWorker,
  deleteWorker,
  getWorkerBalance,
} from "@/utils/supabase";
import withAuth from "@/contexts/withAuth";
import dynamic from "next/dynamic";

// Dynamically import the worker detail page component with custom props
const DynamicWorkerDetailPage = dynamic(
  async () => {
    const mod = await import("@/app/workers/[id]/page");
    // Return a wrapper component that injects our props
    const WorkerDetailWithProps = ({ workerId }: { workerId: string }) => {
      return <mod.default workerId={workerId} />;
    };
    WorkerDetailWithProps.displayName = "WorkerDetailWithProps";
    return WorkerDetailWithProps;
  },
  { ssr: false }
);

function Home() {
  const { t } = useLanguage();
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [filteredWorkers, setFilteredWorkers] = useState<Worker[]>([]);
  const [workerBalances, setWorkerBalances] = useState<{
    [key: string]: number;
  }>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [workerToDelete, setWorkerToDelete] = useState<string | null>(null);
  const [selectedWorkerId, setSelectedWorkerId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    initialDebt: "",
  });
  const [isRemoveMode, setIsRemoveMode] = useState(false);

  // Function to fetch workers and their balances
  const fetchWorkersData = useCallback(async () => {
    try {
      setIsLoading(true);
      const workersData = await getWorkers();
      setWorkers(workersData);
      setFilteredWorkers(workersData);

      // Fetch balances for each worker
      const balances: { [key: string]: number } = {};
      for (const worker of workersData) {
        const balance = await getWorkerBalance(worker.id);
        balances[worker.id] = balance;
      }
      setWorkerBalances(balances);
    } catch (error) {
      console.error("Error loading workers:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load workers and their balances from Supabase
  useEffect(() => {
    fetchWorkersData();
  }, [fetchWorkersData]);

  // Refresh data when returning from worker details
  useEffect(() => {
    if (!selectedWorkerId) {
      fetchWorkersData();
    }
  }, [selectedWorkerId, fetchWorkersData]);

  // Filter workers based on search query
  useEffect(() => {
    if (searchQuery.trim() === "") {
      // Sort workers by balance: positive values (highest to lowest), then negative values (lowest to highest), with zeros at the end
      const sortedWorkers = [...workers].sort((a, b) => {
        const balanceA = workerBalances[a.id] || 0;
        const balanceB = workerBalances[b.id] || 0;

        // If one is zero and the other isn't, put the zero at the end
        if (balanceA === 0 && balanceB !== 0) return 1;
        if (balanceA !== 0 && balanceB === 0) return -1;

        // If one is positive and one is negative, positive goes first
        if (balanceA > 0 && balanceB < 0) return -1;
        if (balanceA < 0 && balanceB > 0) return 1;

        // If both are positive, sort from highest to lowest
        if (balanceA > 0 && balanceB > 0) return balanceB - balanceA;

        // If both are negative, sort from lowest to highest (most negative first)
        return balanceA - balanceB;
      });

      setFilteredWorkers(sortedWorkers);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = workers
      .filter(
        (worker) =>
          worker.name.toLowerCase().includes(query) ||
          worker.phone.toLowerCase().includes(query)
      )
      .sort((a, b) => {
        const balanceA = workerBalances[a.id] || 0;
        const balanceB = workerBalances[b.id] || 0;

        // If one is zero and the other isn't, put the zero at the end
        if (balanceA === 0 && balanceB !== 0) return 1;
        if (balanceA !== 0 && balanceB === 0) return -1;

        // If one is positive and one is negative, positive goes first
        if (balanceA > 0 && balanceB < 0) return -1;
        if (balanceA < 0 && balanceB > 0) return 1;

        // If both are positive, sort from highest to lowest
        if (balanceA > 0 && balanceB > 0) return balanceB - balanceA;

        // If both are negative, sort from lowest to highest (most negative first)
        return balanceA - balanceB;
      });

    setFilteredWorkers(filtered);
  }, [searchQuery, workers, workerBalances]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setFormData({
      name: "",
      phone: "",
      initialDebt: "",
    });
  };

  const handleAddWorker = async () => {
    if (!formData.name || !formData.phone) return;

    setIsSubmitting(true);

    try {
      // Create new worker in Supabase
      const newWorker = await createWorker({
        name: formData.name,
        phone: formData.phone,
        ...(formData.initialDebt && {
          initialDebt: Number(formData.initialDebt),
        }),
      });

      // Update state
      setWorkers((prev) => [newWorker, ...prev]);
      setFilteredWorkers((prev) => [newWorker, ...prev]);

      // Close modal and reset form
      setShowAddModal(false);
      resetForm();
    } catch (error) {
      console.error("Error adding worker:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!workerToDelete) return;

    try {
      // Delete worker using the Supabase utility
      await deleteWorker(workerToDelete);

      // Update local state
      setWorkers(workers.filter((worker) => worker.id !== workerToDelete));
      setFilteredWorkers(
        filteredWorkers.filter((worker) => worker.id !== workerToDelete)
      );

      // If the deleted worker was selected, go back to list view
      if (selectedWorkerId === workerToDelete) {
        setSelectedWorkerId(null);
      }

      // Close modal
      setShowDeleteModal(false);
      setWorkerToDelete(null);
    } catch (error) {
      console.error("Error deleting worker:", error);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setWorkerToDelete(null);
  };

  const handleWorkerClick = (workerId: string) => {
    setSelectedWorkerId(workerId);
  };

  const toggleRemoveMode = () => {
    setIsRemoveMode(!isRemoveMode);
    if (isRemoveMode) {
      setWorkerToDelete(null);
    }
  };

  const handleCardClick = (workerId: string) => {
    if (isRemoveMode) {
      setWorkerToDelete(workerId === workerToDelete ? null : workerId);
    } else {
      handleWorkerClick(workerId);
    }
  };

  const openDeleteConfirmation = () => {
    if (workerToDelete) {
      setShowDeleteModal(true);
    }
  };

  // If a worker is selected, show their details page
  if (selectedWorkerId) {
    return (
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <Button
            onClick={() => setSelectedWorkerId(null)}
            className="flex items-center"
            variant="ghost"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            {t("common.back")}
          </Button>
        </div>
        <div key={selectedWorkerId}>
          <DynamicWorkerDetailPage workerId={selectedWorkerId} />
        </div>
      </div>
    );
  }

  // Otherwise, show the list of workers
  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 drop-shadow-sm">
          {t("nav.workers")}
        </h1>
        <div className="flex space-x-2 sm:space-x-3">
          <Button
            className={`flex items-center shadow-sm ${
              isRemoveMode
                ? "bg-gray-600 hover:bg-gray-700"
                : "bg-red-600 hover:bg-red-700"
            } text-white text-xs sm:text-sm py-1 px-2 sm:py-2 sm:px-3`}
            onClick={toggleRemoveMode}
          >
            <UserMinusIcon className="h-4 w-4 mr-1" />
            {isRemoveMode ? t("common.cancel") : t("common.removeUser")}
          </Button>
          <Button
            className="flex items-center bg-blue-600 hover:bg-blue-700 text-white shadow-sm text-xs sm:text-sm py-1 px-2 sm:py-2 sm:px-3"
            onClick={() => setShowAddModal(true)}
          >
            <UserPlusIcon className="h-4 w-4 mr-1" />
            {t("worker.add")}
          </Button>
        </div>
      </div>

      {/* Search Filter */}
      <div className="mb-4 sm:mb-6">
        <div className="relative">
          <MagnifyingGlassIcon className="h-4 w-4 sm:h-5 sm:w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
          <Input
            type="text"
            placeholder={t("common.search") || "Search..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 sm:pl-10 pr-4 py-1 sm:py-2 text-sm border rounded-lg shadow-sm text-gray-900"
          />
        </div>
      </div>

      {/* Remove Mode Notification */}
      {isRemoveMode && (
        <div className="mb-4 sm:mb-6 p-2 sm:p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800 text-xs sm:text-sm">
            {t("common.selectUserToRemove") || "Select a person to remove"}
          </p>
          <div className="flex justify-end mt-2">
            <Button
              variant="danger"
              disabled={!workerToDelete}
              onClick={openDeleteConfirmation}
              size="sm"
              className="py-1 px-2 text-xs sm:text-sm"
            >
              <TrashIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
              {t("common.delete")}
            </Button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-6 sm:py-10">
          <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-t-2 border-b-2 border-indigo-600"></div>
        </div>
      ) : filteredWorkers.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {filteredWorkers.map((worker) => (
            <div
              key={worker.id}
              className={`h-full transition-all bg-white border cursor-pointer rounded-lg ${
                isRemoveMode
                  ? worker.id === workerToDelete
                    ? "border-red-500 shadow-md ring-2 ring-red-500"
                    : "border-gray-200 hover:border-red-200"
                  : "border-gray-200 hover:shadow-lg"
              }`}
              onClick={() => handleCardClick(worker.id)}
            >
              <Card className="h-full border-0 shadow-none">
                <CardContent
                  className={`p-3 sm:pt-4 ${
                    isRemoveMode && worker.id === workerToDelete
                      ? "bg-red-50"
                      : ""
                  }`}
                >
                  <div className="block">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex justify-between items-center">
                      <span>{worker.name}</span>
                      <span
                        className={`text-xs sm:text-sm ${
                          workerBalances[worker.id] < 0
                            ? "text-red-500"
                            : "text-green-500"
                        } cursor-pointer hover:underline`}
                        onClick={(e) => {
                          e.stopPropagation();
                          // Store the balance to use it when opening the worker page
                          localStorage.setItem(
                            "prefilledAmount",
                            Math.abs(workerBalances[worker.id] || 0).toString()
                          );
                          localStorage.setItem("openUsageModal", "true");
                          handleWorkerClick(worker.id);
                        }}
                      >
                        {`₹${workerBalances[worker.id] || 0}`}
                      </span>
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-700 mt-1">
                      {worker.phone}
                    </p>
                    {worker.initialDebt && (
                      <p className="text-xs sm:text-sm text-red-700 font-medium mt-1">
                        {t("worker.debt")}: ₹{worker.initialDebt}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-6 sm:py-10">
          <p className="text-gray-500 text-sm">
            {t("common.noResults") || "No results found"}
          </p>
        </div>
      )}

      {/* Add Person Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-indigo-600/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white/95 backdrop-blur-sm rounded-lg p-6 max-w-lg w-full shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-indigo-900">
                {t("worker.add")}
              </h2>
              <Button
                variant="ghost"
                className="p-1"
                onClick={() => setShowAddModal(false)}
              >
                <XMarkIcon className="h-5 w-5" />
              </Button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">
                  {t("worker.name")}
                </label>
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder={t("worker.name") || "Name"}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">
                  {t("worker.phone")}
                </label>
                <Input
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder={t("worker.phone") || "Phone"}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">
                  {t("worker.initialDebt")}
                </label>
                <Input
                  name="initialDebt"
                  value={formData.initialDebt}
                  onChange={handleInputChange}
                  placeholder={t("worker.initialDebt") || "Initial Debt"}
                  className="w-full"
                />
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <Button
                  variant="secondary"
                  onClick={() => setShowAddModal(false)}
                >
                  {t("common.cancel")}
                </Button>
                <Button
                  variant="primary"
                  onClick={handleAddWorker}
                  disabled={isSubmitting}
                >
                  {t("common.add")}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-red-600/20 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white/95 backdrop-blur-sm rounded-lg p-6 max-w-sm w-full shadow-xl">
            <h2 className="text-xl font-bold mb-4 text-gray-800">
              {t("common.deleteConfirmation")}
            </h2>
            <p className="mb-6 text-gray-700">{t("common.deleteWarning")}</p>
            <div className="flex justify-end space-x-3">
              <Button variant="secondary" onClick={cancelDelete}>
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

export default withAuth(Home);
