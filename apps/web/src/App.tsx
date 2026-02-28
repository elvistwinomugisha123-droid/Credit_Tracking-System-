import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import CustomerListPage from "./pages/CustomerListPage";
import AddCustomerPage from "./pages/AddCustomerPage";
import CustomerProfilePage from "./pages/CustomerProfilePage";
import NewCreditPage from "./pages/NewCreditPage";
import CreditDetailPage from "./pages/CreditDetailPage";
import RecordPaymentPage from "./pages/RecordPaymentPage";
import ReportsPage from "./pages/ReportsPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<DashboardPage />} />
        <Route path="/customers" element={<CustomerListPage />} />
        <Route path="/customers/new" element={<AddCustomerPage />} />
        <Route path="/customers/:id" element={<CustomerProfilePage />} />
        <Route path="/credits/new" element={<NewCreditPage />} />
        <Route
          path="/customers/:id/credits/new"
          element={<NewCreditPage />}
        />
        <Route path="/credits/:id" element={<CreditDetailPage />} />
        <Route
          path="/credits/:id/payments/new"
          element={<RecordPaymentPage />}
        />
        <Route path="/reports" element={<ReportsPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
