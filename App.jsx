// HotelPro (Roomly) - Main React Application & Routing
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Components
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import RoomDetails from './pages/RoomDetails';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';

// Role-based Dashboard Redirector
const DashboardRedirect = () => {
  const { user } = useAuth();
  if (user?.role === 'admin') {
    return <Navigate to="/admin" replace />;
  }
  return <Navigate to="/user" replace />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="d-flex flex-column min-vh-100 bg-light">
          {/* Main Top Navigation */}
          <Navbar />

          {/* Core Route Viewport */}
          <main className="flex-grow-1">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/room/:id" element={<RoomDetails />} />

              {/* Role-based Smart Redirect */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardRedirect />
                  </ProtectedRoute>
                }
              />

              {/* Customer User Dashboard */}
              <Route
                path="/user"
                element={
                  <ProtectedRoute>
                    <UserDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Administrator Control Panel */}
              <Route
                path="/admin"
                element={
                  <AdminRoute>
                    <AdminDashboard />
                  </AdminRoute>
                }
              />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>

          {/* Footer */}
          <footer className="bg-dark text-white py-4 mt-auto border-top border-secondary">
            <div className="container text-center">
              <div className="d-flex justify-content-center align-items-center gap-2 mb-2">
                <i className="bi bi-buildings-fill text-warning fs-5"></i>
                <span className="fw-bold fs-5">HotelPro</span>
                <span className="badge bg-primary text-white rounded-pill">Roomly</span>
              </div>
              <p className="text-secondary small mb-1">
                College MERN Stack Hotel Booking &amp; Inventory Management Project.
              </p>
              <p className="text-muted small mb-0">
                Built with Node.js, Express, MongoDB, React, Vite &amp; Bootstrap 5.
              </p>
            </div>
          </footer>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
