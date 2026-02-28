import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import type {
  Customer,
  CreditWithStatus,
  Payment,
} from "@credit-manager/types";
import api from "../lib/axios";

interface CustomerHistory {
  customer: Customer;
  credits: (CreditWithStatus & { payments: Payment[] })[];
}

function CustomerProfilePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [history, setHistory] = useState<CustomerHistory | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Inline edit state
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editError, setEditError] = useState("");

  const fetchHistory = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get(`/api/customers/${id}/history`);
      setHistory(res.data.data);
      setError("");
    } catch {
      setError("Failed to load customer profile");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const startEditing = () => {
    if (!history) return;
    setEditName(history.customer.name);
    setEditPhone(history.customer.phone);
    setEditError("");
    setEditing(true);
  };

  const saveEdit = async () => {
    if (!editName.trim() || !editPhone.trim()) {
      setEditError("Name and phone are required");
      return;
    }
    try {
      setEditError("");
      await api.patch(`/api/customers/${id}`, {
        name: editName.trim(),
        phone: editPhone.trim(),
      });
      setEditing(false);
      fetchHistory();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } };
      setEditError(axiosErr.response?.data?.error || "Failed to update");
    }
  };

  // Compute stats from history
  const totalBorrowed =
    history?.credits.reduce((sum, c) => sum + c.totalAmount, 0) ?? 0;
  const totalPaid =
    history?.credits.reduce((sum, c) => sum + c.amountPaid, 0) ?? 0;
  const totalOutstanding = totalBorrowed - totalPaid;

  // Split credits: active/overdue first, completed last
  const activeCredits =
    history?.credits.filter((c) => c.status !== "COMPLETED") ?? [];
  const completedCredits =
    history?.credits.filter((c) => c.status === "COMPLETED") ?? [];

  // All payments flat list
  const allPayments =
    history?.credits.flatMap((credit) =>
      credit.payments.map((p) => ({
        ...p,
        creditType: credit.type,
        creditId: credit.id,
        balanceAfter: credit.totalAmount - credit.amountPaid,
      }))
    ) ?? [];
  allPayments.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-500">
        Loading customer profile...
      </div>
    );
  }

  if (error || !history) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 text-red-700 p-4 rounded-lg">
            {error || "Customer not found"}
          </div>
        </div>
      </div>
    );
  }

  const statusColor = (status: string) => {
    if (status === "COMPLETED") return "bg-green-100 text-green-700";
    if (status === "OVERDUE") return "bg-red-100 text-red-700";
    return "bg-blue-100 text-blue-700";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-4 sm:p-6">
        {/* Header with customer info */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 mb-4">
          {editing ? (
            <div className="space-y-3">
              {editError && (
                <div className="bg-red-50 text-red-700 p-2 rounded text-sm">
                  {editError}
                </div>
              )}
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Name"
              />
              <input
                type="tel"
                value={editPhone}
                onChange={(e) => setEditPhone(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Phone"
              />
              <div className="flex gap-2">
                <button
                  onClick={saveEdit}
                  className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-700"
                >
                  Save
                </button>
                <button
                  onClick={() => setEditing(false)}
                  className="border border-gray-300 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {history.customer.name}
                </h1>
                <p className="text-gray-500">{history.customer.phone}</p>
              </div>
              <button
                onClick={startEditing}
                className="text-gray-400 hover:text-gray-600 p-1"
                title="Edit customer"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                  />
                </svg>
              </button>
            </div>
          )}
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
              Total Borrowed
            </p>
            <p className="text-lg font-bold text-gray-900">
              UGX {totalBorrowed.toLocaleString()}
            </p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
              Total Paid
            </p>
            <p className="text-lg font-bold text-green-600">
              UGX {totalPaid.toLocaleString()}
            </p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
              Outstanding
            </p>
            <p className="text-lg font-bold text-red-600">
              UGX {totalOutstanding.toLocaleString()}
            </p>
          </div>
        </div>

        {/* New Credit button */}
        <div className="mb-4">
          <button
            onClick={() => navigate(`/customers/${id}/credits/new`)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            New Credit
          </button>
        </div>

        {/* Credits list */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Credits</h2>

          {history.credits.length === 0 ? (
            <p className="text-gray-500 text-sm">
              No credits yet for this customer.
            </p>
          ) : (
            <div className="space-y-2">
              {/* Active/Overdue credits first */}
              {activeCredits.map((credit) => (
                <CreditRow
                  key={credit.id}
                  credit={credit}
                  statusColor={statusColor}
                  onClick={() => navigate(`/credits/${credit.id}`)}
                />
              ))}
              {/* Completed credits */}
              {completedCredits.map((credit) => (
                <CreditRow
                  key={credit.id}
                  credit={credit}
                  statusColor={statusColor}
                  onClick={() => navigate(`/credits/${credit.id}`)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Payment history */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">
            Payment History
          </h2>

          {allPayments.length === 0 ? (
            <p className="text-gray-500 text-sm">No payments recorded yet.</p>
          ) : (
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-4 py-2 font-medium text-gray-500">
                      Date
                    </th>
                    <th className="text-left px-4 py-2 font-medium text-gray-500">
                      Amount
                    </th>
                    <th className="text-left px-4 py-2 font-medium text-gray-500 hidden sm:table-cell">
                      Credit
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {allPayments.map((payment) => (
                    <tr key={payment.id}>
                      <td className="px-4 py-2 text-gray-700">
                        {new Date(payment.date).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-2 font-medium text-green-600">
                        UGX {payment.amount.toLocaleString()}
                      </td>
                      <td className="px-4 py-2 text-gray-500 hidden sm:table-cell">
                        {payment.creditType === "CASH_LOAN"
                          ? "Cash Loan"
                          : "Service Credit"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CreditRow({
  credit,
  statusColor,
  onClick,
}: {
  credit: CreditWithStatus;
  statusColor: (status: string) => string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full bg-white rounded-lg border border-gray-200 p-4 flex items-center justify-between hover:bg-gray-50 transition-colors text-left"
    >
      <div>
        <p className="font-medium text-gray-900">
          UGX {credit.totalAmount.toLocaleString()}
        </p>
        <p className="text-sm text-gray-500">
          Balance: UGX {credit.outstandingBalance.toLocaleString()}
        </p>
      </div>
      <div className="flex items-center gap-2">
        {credit.dueDate && (
          <span className="text-xs text-gray-400">
            Due {new Date(credit.dueDate).toLocaleDateString()}
          </span>
        )}
        <span
          className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor(credit.status)}`}
        >
          {credit.status}
        </span>
      </div>
    </button>
  );
}

export default CustomerProfilePage;
