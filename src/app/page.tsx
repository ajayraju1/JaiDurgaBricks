"use client";

import { useEffect, useState } from "react";
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
} from "@heroicons/react/24/outline";
import Link from "next/link";
import {
  getWorkers,
  createWorker,
  deleteWorker,
  getWorkerBalance,
} from "@/utils/supabase";
import withAuth from "@/contexts/withAuth";

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
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    initialDebt: "",
  });

  // Load workers and their balances from Supabase
  useEffect(() => {
    async function fetchWorkers() {
      try {
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
    }

    fetchWorkers();
  }, []);

  // Filter workers based on search query
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredWorkers(workers);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = workers.filter(
      (worker) =>
        worker.name.toLowerCase().includes(query) ||
        worker.phone.toLowerCase().includes(query)
    );
    setFilteredWorkers(filtered);
  }, [searchQuery, workers]);

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

  const handleDeleteClick = (id: string) => {
    setWorkerToDelete(id);
    setShowDeleteModal(true);
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

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 drop-shadow-sm">
          {t("nav.workers")}
        </h1>
        <Button
          className="flex items-center bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
          onClick={() => setShowAddModal(true)}
        >
          <UserPlusIcon className="h-5 w-5 mr-2" />
          {t("worker.add")}
        </Button>
      </div>

      {/* Search Filter */}
      <div className="mb-6">
        <div className="relative">
          <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
          <Input
            type="text"
            placeholder={t("common.search") || "Search..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 border rounded-lg shadow-sm text-gray-900"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
        </div>
      ) : filteredWorkers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredWorkers.map((worker) => (
            <Card
              key={worker.id}
              className="h-full hover:shadow-lg transition-shadow bg-white border border-gray-200"
            >
              <CardContent className="pt-4">
                <Link
                  href={`/workers/${worker.id}`}
                  className="block cursor-pointer"
                >
                  <h3 className="text-lg font-semibold text-gray-900 flex justify-between items-center">
                    <span>{worker.name}</span>
                    <span
                      className={`text-sm ${
                        workerBalances[worker.id] < 0
                          ? "text-red-500"
                          : "text-green-500"
                      }`}
                    >
                      {`₹${workerBalances[worker.id] || 0}`}
                    </span>
                  </h3>
                  <p className="text-sm text-gray-700 mt-1">{worker.phone}</p>
                  {worker.initialDebt && (
                    <p className="text-sm text-red-700 font-medium mt-1">
                      {t("worker.debt")}: ₹{worker.initialDebt}
                    </p>
                  )}
                </Link>
                <div className="mt-3 flex justify-end">
                  <Button
                    className="flex items-center text-sm py-1 px-2 h-auto"
                    variant="danger"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteClick(worker.id);
                    }}
                  >
                    <TrashIcon className="h-3 w-3 mr-1" />
                    {t("common.removeUser")}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-10">
          <p className="text-gray-500">
            {t("common.noResults") || "No results found"}
          </p>
        </div>
      )}

      {/* Add Person Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">
                {t("worker.add")}
              </h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-800 mb-1"
                >
                  {t("worker.name")}
                </label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder={t("worker.name")}
                  className="text-gray-900"
                />
              </div>

              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-gray-800 mb-1"
                >
                  {t("worker.phone")}
                </label>
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter phone number"
                  className="text-gray-900"
                />
              </div>

              <div>
                <label
                  htmlFor="initialDebt"
                  className="block text-sm font-medium text-gray-800 mb-1"
                >
                  {t("worker.debt")} (₹)
                </label>
                <Input
                  id="initialDebt"
                  name="initialDebt"
                  value={formData.initialDebt}
                  onChange={handleInputChange}
                  type="number"
                  placeholder="0"
                  className="text-gray-900"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-4 mt-6">
              <Button
                variant="outline"
                onClick={() => {
                  setShowAddModal(false);
                  resetForm();
                }}
                disabled={isSubmitting}
              >
                {t("common.cancel")}
              </Button>
              <Button
                onClick={handleAddWorker}
                disabled={!formData.name || !formData.phone || isSubmitting}
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <div className="animate-spin h-4 w-4 mr-2 border-2 border-t-transparent rounded-full"></div>
                    {t("common.save")}
                  </div>
                ) : (
                  t("common.save")
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              {t("common.confirmDelete")}
            </h3>
            <p className="mb-6 text-gray-900">
              {t("common.confirmDeleteWorker")}
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

export default withAuth(Home);
