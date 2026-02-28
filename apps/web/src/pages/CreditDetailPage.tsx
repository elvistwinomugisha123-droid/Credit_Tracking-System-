import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../lib/axios";

interface PaymentRecord {
  id: string;
  amount: number;
  date: string;
  balanceAfterPayment: number;
}

interface InstallmentRow {
  number: number;
  amount: number;
  dueDate: string | null;
}

interface CreditDetail {
  id: string;
  customerId: string;
  type: string;
  principalAmount: number;
  interestAmount: number | null;
  totalAmount: number;
  amountPaid: number;
  dueDate: string | null;
  dateIssued: string;
  repaymentType: string;
  installments: number | null;
  status: string;
  outstandingBalance: number;
  paymentProgress: number;
  installmentSchedule: InstallmentRow[];
  paymentHistory: PaymentRecord[];
  customer: { id: string; name: string; phone: string };
}

function CreditDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [credit, setCredit] = useState<CreditDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchCredit = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get(`/api/credits/${id}`);
      setCredit(res.data.data);
      setError("");
    } catch {
      setError("Failed to load credit details");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchCredit();
  }, [fetchCredit]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-500">
        Loading credit details...
      </div>
    );
  }

  if (error || !credit) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 text-red-700 p-4 rounded-lg">
            {error || "Credit not found"}
          </div>
        </div>
      </div>
    );
  }

  const statusColor =
    credit.status === "COMPLETED"
      ? "bg-green-100 text-green-700"
      : credit.status === "OVERDUE"
        ? "bg-red-100 text-red-700"
        : "bg-blue-100 text-blue-700";

  const typeLabel =
    credit.type === "CASH_LOAN" ? "Cash Loan" : "Service Credit";

  const repaymentLabel =
    credit.repaymentType === "ONE_TIME"
      ? "One-Time"
      : credit.repaymentType === "INSTALLMENT"
        ? "Installment"
        : "Flexible";

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-4 sm:p-6">
        {/* Overdue banner */}
        {credit.status === "OVERDUE" && (
          <div className="bg-red-600 text-white px-4 py-3 rounded-lg mb-4 font-medium text-sm">
            This credit is overdue. Due date was{" "}
            {new Date(credit.dueDate!).toLocaleDateString()}.
          </div>
        )}

        {/* Header */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 mb-4">
          <div className="flex items-start justify-between mb-4">
            <div>
              <button
                onClick={() =>
                  navigate(`/customers/${credit.customer.id}`)
                }
                className="text-blue-600 hover:underline font-medium text-lg"
              >
                {credit.customer.name}
              </button>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-gray-100 text-gray-600">
                  {typeLabel}
                </span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor}`}
                >
                  {credit.status}
                </span>
              </div>
            </div>
            {credit.status !== "COMPLETED" && (
              <button
                onClick={() => navigate(`/credits/${credit.id}/payments/new`)}
                className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
              >
                Record Payment
              </button>
            )}
          </div>

          {/* Key figures grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">
                Principal
              </p>
              <p className="text-lg font-bold text-gray-900">
                UGX {credit.principalAmount.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">
                Interest
              </p>
              <p className="text-lg font-bold text-gray-900">
                {credit.interestAmount
                  ? `UGX ${credit.interestAmount.toLocaleString()}`
                  : "No interest"}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">
                Total Due
              </p>
              <p className="text-lg font-bold text-gray-900">
                UGX {credit.totalAmount.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">
                Amount Paid
              </p>
              <p className="text-lg font-bold text-green-600">
                UGX {credit.amountPaid.toLocaleString()}
              </p>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <p className="text-xs text-gray-500 uppercase tracking-wide">
                Outstanding Balance
              </p>
              <p className="text-2xl font-bold text-red-600">
                UGX {credit.outstandingBalance.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Payment progress bar */}
          <div className="mb-4">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Payment Progress</span>
              <span>{credit.paymentProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className={`h-2.5 rounded-full transition-all ${
                  credit.paymentProgress === 100
                    ? "bg-green-500"
                    : "bg-blue-500"
                }`}
                style={{ width: `${credit.paymentProgress}%` }}
              />
            </div>
          </div>

          {/* Meta info */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
            <div>
              <span className="text-gray-500">Due Date</span>
              <p className="font-medium">
                {credit.dueDate
                  ? new Date(credit.dueDate).toLocaleDateString()
                  : "Open-ended"}
              </p>
            </div>
            <div>
              <span className="text-gray-500">Repayment Type</span>
              <p className="font-medium">{repaymentLabel}</p>
            </div>
            <div>
              <span className="text-gray-500">Date Issued</span>
              <p className="font-medium">
                {new Date(credit.dateIssued).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* Installment schedule (only if INSTALLMENT type) */}
        {credit.repaymentType === "INSTALLMENT" &&
          credit.installmentSchedule.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 mb-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">
                Installment Schedule
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left px-3 py-2 font-medium text-gray-500">
                        #
                      </th>
                      <th className="text-left px-3 py-2 font-medium text-gray-500">
                        Amount
                      </th>
                      <th className="text-left px-3 py-2 font-medium text-gray-500">
                        Due Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {credit.installmentSchedule.map((row) => (
                      <tr key={row.number}>
                        <td className="px-3 py-2 text-gray-700">
                          {row.number}
                        </td>
                        <td className="px-3 py-2 font-medium">
                          UGX {row.amount.toLocaleString()}
                        </td>
                        <td className="px-3 py-2 text-gray-500">
                          {row.dueDate
                            ? new Date(row.dueDate).toLocaleDateString()
                            : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        {/* Payment history */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">
            Payment History
          </h2>

          {credit.paymentHistory.length === 0 ? (
            <p className="text-gray-500 text-sm">No payments recorded yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-3 py-2 font-medium text-gray-500">
                      Date
                    </th>
                    <th className="text-left px-3 py-2 font-medium text-gray-500">
                      Amount Paid
                    </th>
                    <th className="text-left px-3 py-2 font-medium text-gray-500">
                      Balance After
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {credit.paymentHistory.map((payment) => (
                    <tr key={payment.id}>
                      <td className="px-3 py-2 text-gray-700">
                        {new Date(payment.date).toLocaleDateString()}
                      </td>
                      <td className="px-3 py-2 font-medium text-green-600">
                        UGX {payment.amount.toLocaleString()}
                      </td>
                      <td className="px-3 py-2 text-gray-500">
                        UGX {payment.balanceAfterPayment.toLocaleString()}
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

export default CreditDetailPage;
