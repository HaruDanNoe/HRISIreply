import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminDashboard from "./pages/AdminDashboard";
import CoachDashboard from "./pages/CoachDashboard";
import CoachAttendancePage from "./pages/CoachAttendancePage";
import EmployeeDashboard from "./pages/EmployeeDashboard.jsx";
import EmployeeAttendancePage from "./pages/EmployeeAttendancePage.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/coach" element={<CoachDashboard />} />
        <Route path="/coach/attendance" element={<CoachAttendancePage />} />
        <Route path="/employee" element={<EmployeeDashboard />} />
        <Route path="/employee/attendance" element={<EmployeeAttendancePage />} />
      </Routes>
    </BrowserRouter>
  );
}