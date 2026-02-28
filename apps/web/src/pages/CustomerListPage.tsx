import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import type { CustomerWithStats } from "@credit-manager/types";
import api from "../lib/axios";

function CustomerListPage() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<CustomerWithStats[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchCustomers = useCallback(async (query: string) => {
    try {
      setLoading(true);
      const params = query ? { search: query } : {};
      const res = await api.get("/api/customers", { params });
      setCustomers(res.data.data);
      setError("");
    } catch {
      setError("Failed to load customers");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCustomers(search);
  }, [search, fetchCustomers]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-4 sm:p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
          <button
            onClick={() => navigate("/customers/new")}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            Add Customer
          </button>
        </div>

        {/* Search */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search by name or phone number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
          />
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="text-center py-12 text-gray-500">
            Loading customers...
          </div>
        )}

        {/* Empty state */}
        {!loading && customers.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">
              {search
                ? "No customers match your search."
                : "No customers yet. Add your first customer to get started."}
            </p>
            {!search && (
              <button
                onClick={() => navigate("/customers/new")}
                className="text-blue-600 font-medium hover:underline"
              >
                Add Customer
              </button>
            )}
          </div>
        )}

        {/* Customer list */}
        {!loading && customers.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-200">
            {customers.map((customer) => (
              <button
                key={customer.id}
                onClick={() => navigate(`/customers/${customer.id}`)}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors text-left"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-gray-900 truncate">
                    {customer.name}
                  </p>
                  <p className="text-sm text-gray-500">{customer.phone}</p>
                </div>
                <div className="flex items-center gap-3 ml-4 shrink-0">
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      UGX {customer.totalOutstanding.toLocaleString()}
                    </p>
                    <span
                      className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium ${
                        customer.hasActiveCredits
                          ? "bg-blue-100 text-blue-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {customer.hasActiveCredits
                        ? "Has Active Credits"
                        : "All Cleared"}
                    </span>
                  </div>
                  <svg
                    className="w-5 h-5 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default CustomerListPage;
