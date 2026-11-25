import React, { Suspense, lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { MainLayout } from '../layouts/MainLayout';
import { AdminLayout } from '../layouts/AdminLayout';
import { ProtectedRoute } from '../components/ProtectedRoute';

const LandingPage = lazy(() =>
  import('../pages/LandingPage').then((m) => ({ default: m.LandingPage }))
);
const LoginPage = lazy(() =>
  import('../pages/LoginPage').then((m) => ({ default: m.LoginPage }))
);
const RegisterPage = lazy(() =>
  import('../pages/RegisterPage').then((m) => ({ default: m.RegisterPage }))
);
const VoterDashboardPage = lazy(() =>
  import('../pages/VoterDashboardPage').then((m) => ({ default: m.VoterDashboardPage }))
);
const ElectionsDirectoryPage = lazy(() =>
  import('../pages/ElectionsDirectoryPage').then((m) => ({ default: m.ElectionsDirectoryPage }))
);
const ElectionDetailPage = lazy(() =>
  import('../pages/ElectionDetailPage').then((m) => ({ default: m.ElectionDetailPage }))
);
const CandidatesPage = lazy(() =>
  import('../pages/CandidatesPage').then((m) => ({ default: m.CandidatesPage }))
);
const DemoVotingBoothPage = lazy(() =>
  import('../pages/DemoVotingBoothPage').then((m) => ({ default: m.DemoVotingBoothPage }))
);
const ResultsPage = lazy(() =>
  import('../pages/ResultsPage').then((m) => ({ default: m.ResultsPage }))
);
const TransparencyPage = lazy(() =>
  import('../pages/TransparencyPage').then((m) => ({ default: m.TransparencyPage }))
);
const ProfilePage = lazy(() =>
  import('../pages/ProfilePage').then((m) => ({ default: m.ProfilePage }))
);

const AdminOverviewPage = lazy(() =>
  import('../pages/admin/AdminOverviewPage').then((m) => ({ default: m.AdminOverviewPage }))
);
const AdminElectionsPage = lazy(() =>
  import('../pages/admin/AdminElectionsPage').then((m) => ({ default: m.AdminElectionsPage }))
);
const AdminCandidatesPage = lazy(() =>
  import('../pages/admin/AdminCandidatesPage').then((m) => ({ default: m.AdminCandidatesPage }))
);
const AdminUsersPage = lazy(() =>
  import('../pages/admin/AdminUsersPage').then((m) => ({ default: m.AdminUsersPage }))
);
const AdminLogsPage = lazy(() =>
  import('../pages/admin/AdminLogsPage').then((m) => ({ default: m.AdminLogsPage }))
);

const RouteFallback: React.FC = () => (
  <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
    <div className="border border-[#D9D0C1] bg-white p-8 animate-pulse">
      <div className="h-3 w-28 bg-[#EDE7DA]" />
      <div className="mt-4 h-7 w-64 bg-[#EDE7DA]" />
      <div className="mt-3 h-4 w-full max-w-md bg-[#F5F1E8]" />
    </div>
  </div>
);

export const AppRoutes: React.FC = () => {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/elections" element={<ElectionsDirectoryPage />} />
          <Route path="/elections/:id" element={<ElectionDetailPage />} />
          <Route path="/candidates" element={<CandidatesPage />} />
          <Route path="/results" element={<ResultsPage />} />
          <Route path="/transparency" element={<TransparencyPage />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <VoterDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/vote/:id"
            element={
              <ProtectedRoute>
                <DemoVotingBoothPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
        </Route>

        <Route
          path="/admin"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminOverviewPage />} />
          <Route path="elections" element={<AdminElectionsPage />} />
          <Route path="candidates" element={<AdminCandidatesPage />} />
          <Route path="users" element={<AdminUsersPage />} />
          <Route path="logs" element={<AdminLogsPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
};
