import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { DashboardPage } from './components/dashboard/DashboardPage';
import { ApplicantProfilesPage } from './components/applicants/ApplicantProfilesPage';
import { ApplicantSkillsPage } from './components/applicants/ApplicantSkillsPage';
import { ApplicantEducationPage } from './components/applicants/ApplicantEducationPage';
import { ApplicantWorkHistoryPage } from './components/applicants/ApplicantWorkHistoryPage';
import { ApplicantResumesPage } from './components/applicants/ApplicantResumesPage';
import { ApplicantJobApplicationsPage } from './components/applicants/ApplicantJobApplicationsPage';
import { CompanyJobsPage } from './components/companies/CompanyJobsPage';
import { CompanyProfilesPage } from './components/companies/CompanyProfilesPage';
import { CompanyDescriptionsPage } from './components/companies/CompanyDescriptionsPage';
import { CompanyLocationsPage } from './components/companies/CompanyLocationsPage';
import { CompanyJobDescriptionsPage } from './components/companies/CompanyJobDescriptionsPage';
import { CompanyJobEducationPage } from './components/companies/CompanyJobEducationPage';
import { SecurityLoginsPage } from './components/security/SecurityLoginsPage';
import { SecurityRolesPage } from './components/security/SecurityRolesPage';
import { CountryCodesPage } from './components/system/CountryCodesPage';
import { LanguageCodesPage } from './components/system/LanguageCodesPage';
import { Toaster } from 'sonner';
import './App.css';

// Placeholder components for routes not yet implemented
const PlaceholderPage = ({ title }: { title: string }) => (
  <div className="flex items-center justify-center h-64">
    <div className="text-center">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
      <p className="text-gray-600">This module is coming soon...</p>
    </div>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Navigate to="/dashboard" replace />} />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            
            {/* Applicant Routes */}
            <Route path="applicants/profiles" element={<ApplicantProfilesPage />} />
            <Route path="applicants/education" element={<ApplicantEducationPage />} />
            <Route path="applicants/skills" element={<ApplicantSkillsPage />} />
            <Route path="applicants/work-history" element={<ApplicantWorkHistoryPage />} />
            <Route path="applicants/resumes" element={<ApplicantResumesPage />} />
            <Route path="applicants/applications" element={<ApplicantJobApplicationsPage />} />
            
            {/* Company Routes */}
            <Route path="companies/profiles" element={<CompanyProfilesPage />} />
            <Route path="companies/descriptions" element={<CompanyDescriptionsPage />} />
            <Route path="companies/locations" element={<CompanyLocationsPage />} />
            <Route path="companies/jobs" element={<CompanyJobsPage />} />
            <Route path="companies/job-descriptions" element={<CompanyJobDescriptionsPage />} />
            <Route path="companies/job-education" element={<CompanyJobEducationPage />} />
            <Route path="companies/job-skills" element={<PlaceholderPage title="Job Skill Requirements" />} />
            
            {/* Security Routes */}
            <Route path="security/logins" element={<SecurityLoginsPage />} />
            <Route path="security/roles" element={<SecurityRolesPage />} />
            <Route path="security/login-roles" element={<PlaceholderPage title="Login Roles" />} />
            <Route path="security/login-logs" element={<PlaceholderPage title="Login Logs" />} />
            
            {/* System Routes */}
            <Route path="system/countries" element={<CountryCodesPage />} />
            <Route path="system/languages" element={<LanguageCodesPage />} />
          </Route>
        </Routes>
      </Router>
      <Toaster position="top-right" />
    </AuthProvider>
  );
}

export default App;
