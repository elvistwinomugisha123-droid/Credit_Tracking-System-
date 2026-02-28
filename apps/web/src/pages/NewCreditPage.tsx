import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { Customer } from "@credit-manager/types";
import api from "../lib/axios";

function NewCreditPage() {
  const navigate = useNavigate();
  const { id: prefilledCustomerId } = useParams<{ id: string }>();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customerSearch, setCustomerSearch] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  const [customerId, setCustomerId] = useState(prefilledCustomerId || "");
  const [customerName, setCustomerName] = useState("");
  const [type, setType] = useState<"CASH_LOAN" | "SERVICE_CREDIT">("CASH_LOAN");
  const [principalAmount, setPrincipalAmount] = useState("");
  const [dateIssued, setDateIssued] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [interestAmount, setInterestAmount] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [repaymentType, setRepaymentType] = useState<
    "ONE_TIME" | "INSTALLMENT" | "FLEXIBLE"
  >("FLEXIBLE");
  const [installments, setInstallments] = useState("");

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Fetch customer list for dropdown
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const params = customerSearch ? { search: customerSearch } : {};
        const res = await api.get("/api/customers", { params });
        setCustomers(res.data.data);
      } catch {
        // Silently fail — dropdown just stays empty
      }
    };
    fetchCustomers();
  }, [customerSearch]);

  // Pre-fill customer name if coming from profile
  useEffect(() => {
    if (prefilledCustomerId) {
      const fetchCustomer = async () => {
        try {
          const res = await api.get(`/api/customers/${prefilledCustomerId}`);
          setCustomerName(res.data.data.name);
          setCustomerId(prefilledCustomerId);
        } catch {
          // Customer not found — let user pick manually
        }
      };
      fetchCustomer();
    }
  }, [prefilledCustomerId]);

  // Live preview calculations
  const principal = parseFloat(principalAmount) || 0;
  const interest = parseFloat(interestAmount) || 0;
  const totalDue = principal + interest;
  const monthlyPayment =
    repaymentType === "INSTALLMENT" && parseInt(installments) > 0
      ? totalDue / parseInt(installments)
      : null;

  const selectCustomer = (c: Customer) => {
    setCustomerId(c.id);
    setCustomerName(c.name);
    setCustomerSearch("");
    setShowDropdown(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!customerId) {
      setError("Please select a customer");
      return;
    }
    if (principal <= 0) {
      setError("Principal amount must be greater than zero");
      return;
    }
    if (!dateIssued) {
      setError("Date issued is required");
      return;
    }
    if (repaymentType === "INSTALLMENT" && (!installments || parseInt(installments) < 1)) {
      setError("Number of installments is required for installment type");
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.post("/api/credits", {
        customerId,
        type,
        principalAmount: principal,
        interestAmount: interest > 0 ? interest : null,
        dateIssued,
        dueDate: dueDate || null,
        repaymentType,
        installments:
          repaymentType === "INSTALLMENT" ? parseInt(installments) : null,
      });
      navigate(`/credits/${res.data.data.id}`);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } };
      setError(axiosErr.response?.data?.error || "Failed to create credit");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-lg mx-auto p-4 sm:p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">New Credit</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Customer selector */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Customer <span className="text-red-500">*</span>
            </label>
            {customerId && customerName ? (
              <div className="flex items-center justify-between px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50">
                <span className="font-medium text-gray-900">
                  {customerName}
                </span>
                {!prefilledCustomerId && (
                  <button
                    type="button"
                    onClick={() => {
                      setCustomerId("");
                      setCustomerName("");
                    }}
                    className="text-gray-400 hover:text-gray-600 text-sm"
                  >
                    Change
                  </button>
                )}
              </div>
            ) : (
              <>
                <input
                  type="text"
                  value={customerSearch}
                  onChange={(e) => {
                    setCustomerSearch(e.target.value);
                    setShowDropdown(true);
                  }}
                  onFocus={() => setShowDropdown(true)}
                  placeholder="Search customer by name or phone..."
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {showDropdown && customers.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    {customers.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => selectCustomer(c)}
                        className="w-full px-4 py-2 text-left hover:bg-gray-50 text-sm"
                      >
                        <span className="font-medium">{c.name}</span>
                        <span className="text-gray-500 ml-2">{c.phone}</span>
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Credit type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Credit Type <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setType("CASH_LOAN")}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium border transition-colors ${
                  type === "CASH_LOAN"
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                }`}
              >
                Cash Loan
              </button>
              <button
                type="button"
                onClick={() => setType("SERVICE_CREDIT")}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium border transition-colors ${
                  type === "SERVICE_CREDIT"
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                }`}
              >
                Service Credit
              </button>
            </div>
          </div>

          {/* Principal amount */}
          <div>
            <label
              htmlFor="principal"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Principal Amount (UGX) <span className="text-red-500">*</span>
            </label>
            <input
              id="principal"
              type="number"
              min="0"
              step="any"
              value={principalAmount}
              onChange={(e) => setPrincipalAmount(e.target.value)}
              placeholder="e.g. 500000"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Date issued */}
          <div>
            <label
              htmlFor="dateIssued"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Date Issued <span className="text-red-500">*</span>
            </label>
            <input
              id="dateIssued"
              type="date"
              value={dateIssued}
              onChange={(e) => setDateIssued(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Interest amount (optional) */}
          <div>
            <label
              htmlFor="interest"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Interest Amount (UGX){" "}
              <span className="text-gray-400 font-normal">— optional</span>
            </label>
            <input
              id="interest"
              type="number"
              min="0"
              step="any"
              value={interestAmount}
              onChange={(e) => setInterestAmount(e.target.value)}
              placeholder="Leave blank for zero interest"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Due date (optional) */}
          <div>
            <label
              htmlFor="dueDate"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Due Date{" "}
              <span className="text-gray-400 font-normal">— optional</span>
            </label>
            <input
              id="dueDate"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Repayment type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Repayment Type <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              {(["ONE_TIME", "INSTALLMENT", "FLEXIBLE"] as const).map((rt) => (
                <button
                  key={rt}
                  type="button"
                  onClick={() => setRepaymentType(rt)}
                  className={`flex-1 py-2 px-2 rounded-lg text-xs sm:text-sm font-medium border transition-colors ${
                    repaymentType === rt
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {rt === "ONE_TIME"
                    ? "One-Time"
                    : rt === "INSTALLMENT"
                      ? "Installment"
                      : "Flexible"}
                </button>
              ))}
            </div>
          </div>

          {/* Installments (shown only if INSTALLMENT selected) */}
          {repaymentType === "INSTALLMENT" && (
            <div>
              <label
                htmlFor="installments"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Number of Installments{" "}
                <span className="text-red-500">*</span>
              </label>
              <input
                id="installments"
                type="number"
                min="1"
                step="1"
                value={installments}
                onChange={(e) => setInstallments(e.target.value)}
                placeholder="e.g. 6"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          )}

          {/* Live preview */}
          {principal > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Principal</span>
                <span className="font-medium">
                  UGX {principal.toLocaleString()}
                </span>
              </div>
              {interest > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Interest</span>
                  <span className="font-medium">
                    UGX {interest.toLocaleString()}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-sm font-bold border-t border-blue-200 pt-2">
                <span>Total Due</span>
                <span>UGX {totalDue.toLocaleString()}</span>
              </div>
              {monthlyPayment !== null && (
                <div className="flex justify-between text-sm text-blue-700">
                  <span>Monthly Payment</span>
                  <span>
                    UGX {Math.round(monthlyPayment).toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-blue-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "Creating..." : "Submit"}
            </button>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-4 py-2.5 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default NewCreditPage;
