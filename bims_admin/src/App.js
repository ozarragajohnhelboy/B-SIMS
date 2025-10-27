import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './components/Login';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import ResidentsManagement from './components/ResidentsManagement';
import HouseholdsManagement from './components/HouseholdsManagement';
import DocumentsManagement from './components/DocumentsManagement';
import BlottersManagement from './components/BlottersManagement';
import ComplaintsManagement from './components/ComplaintsManagement';
import FinancialManagement from './components/FinancialManagement';
import ProjectManagement from './components/ProjectManagement';
import AnnouncementManagement from './components/AnnouncementManagement';
import UserManagement from './components/UserManagement';
import Settings from './components/Settings';
import Reports from './components/Reports';
import ProtectedRoute from './components/ProtectedRoute';

const AppRoutes = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route 
        path="/login" 
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />} 
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/residents"
        element={
          <ProtectedRoute>
            <Layout>
              <ResidentsManagement />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/households"
        element={
          <ProtectedRoute>
            <Layout>
              <HouseholdsManagement />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/documents"
        element={
          <ProtectedRoute>
            <Layout>
              <DocumentsManagement />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/blotters"
        element={
          <ProtectedRoute>
            <Layout>
              <BlottersManagement />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/complaints"
        element={
          <ProtectedRoute>
            <Layout>
              <ComplaintsManagement />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/financial"
        element={
          <ProtectedRoute>
            <Layout>
              <FinancialManagement />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/projects"
        element={
          <ProtectedRoute>
            <Layout>
              <ProjectManagement />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/announcements"
        element={
          <ProtectedRoute>
            <Layout>
              <AnnouncementManagement />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/reports"
        element={
          <ProtectedRoute>
            <Layout>
              <Reports />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/users"
        element={
          <ProtectedRoute>
            <Layout>
              <UserManagement />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <Layout>
              <Settings />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
