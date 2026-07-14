import { Routes, Route, Navigate } from "react-router-dom";
import Landing from "@/pages/Landing";
import Login from "@/pages/auth/Login";
import Signup from "@/pages/auth/Signup";
import { ProtectedRoute } from "@/components/shared/ProtectedRoute";

import FamilyLayout from "@/pages/family/FamilyLayout";
import Onboarding from "@/pages/family/Onboarding";
import MatchingDashboard from "@/pages/family/MatchingDashboard";
import FamilyRequests from "@/pages/family/Requests";
import CareLog from "@/pages/family/CareLog";
import Wallet from "@/pages/family/Wallet";

import NurseLayout from "@/pages/nurse/NurseLayout";
import NurseRequests from "@/pages/nurse/Requests";
import ShiftTasks from "@/pages/nurse/ShiftTasks";
import Finance from "@/pages/nurse/Finance";
import Academy from "@/pages/nurse/Academy";

import AdminLayout from "@/pages/admin/AdminLayout";
import Overview from "@/pages/admin/Overview";
import VerificationQueue from "@/pages/admin/VerificationQueue";
import Disputes from "@/pages/admin/Disputes";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      <Route element={<ProtectedRoute allow={["family"]} />}>
        <Route path="/family" element={<FamilyLayout />}>
          <Route index element={<Navigate to="onboarding" replace />} />
          <Route path="onboarding" element={<Onboarding />} />
          <Route path="matches" element={<MatchingDashboard />} />
          <Route path="requests" element={<FamilyRequests />} />
          <Route path="care-log" element={<CareLog />} />
          <Route path="wallet" element={<Wallet />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute allow={["nurse"]} />}>
        <Route path="/nurse" element={<NurseLayout />}>
          <Route index element={<Navigate to="requests" replace />} />
          <Route path="requests" element={<NurseRequests />} />
          <Route path="shift" element={<ShiftTasks />} />
          <Route path="finance" element={<Finance />} />
          <Route path="academy" element={<Academy />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute allow={["admin"]} />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="overview" replace />} />
          <Route path="overview" element={<Overview />} />
          <Route path="verification" element={<VerificationQueue />} />
          <Route path="disputes" element={<Disputes />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
