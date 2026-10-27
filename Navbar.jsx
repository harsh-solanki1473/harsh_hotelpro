// HotelPro (Roomly) - Navigation Bar Component
import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, login, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Instant demo switch helpers for college presentation
  const handleQuickSwitchAdmin = async () => {
    try {
      const res = await api.post('/auth/login', {
        email: 'admin@hotelpro.com',
        password: 'Admin@123',
      });
      if (res.data.success) {
        login(res.data.token, res.data.user);
        navigate('/admin');
      }
    } catch (e) {
      console.error(e);
      navigate('/login');
    }
  };

  const handleQuickSwitchUser = async () => {
    try {
      // Try login with sample user or register one
      let res;
      try {
        res = await api.post('/auth/login', {
          email: 'rahul@example.com',
          password: 'Password123',
        });
      } catch (err) {
        // Register if not exists
        await api.post('/auth/register', {
          name: 'Rahul Sharma',
          number: '9876543210',
          email: 'rahul@example.com',
          password: 'Password123',
          gender: 'Male',
          age: 25,
        });
        res = await api.post('/auth/login', {
          email: 'rahul@example.com',
          password: 'Password123',
        });
      }
      if (res?.data?.success) {
        login(res.data.token, res.data.user);
        navigate('/user');
      }
    } catch (e) {
      console.error(e);
      navigate('/login');
    }
  };

  return (
    <header className="sticky-top shadow-sm">
      {/* Top Demo Bar */}
      <div className="bg-primary text-white py-1 px-3 d-flex flex-wrap justify-content-between align-items-center small">
        <div className="d-flex align-items-center gap-2">
          <span className="badge bg-warning text-dark fw-bold">College Project Demo Mode</span>
          <span className="d-none d-md-inline text-white-50">
            HotelPro (Roomly) Full-Stack MERN System
          </span>
        </div>
        <div className="d-flex align-items-center gap-2">
          <span className="text-white-50 d-none d-sm-inline">Quick Switch:</span>
          <button
            onClick={handleQuickSwitchAdmin}
            className="btn btn-sm btn-outline-light py-0 px-2 rounded-pill fw-semibold"
            style={{ fontSize: '0.75rem' }}
            title="Instant switch to Administrator"
          >
            <i className="bi bi-shield-lock-fill text-warning me-1"></i> Admin Panel
          </button>
          <button
            onClick={handleQuickSwitchUser}
            className="btn btn-sm btn-outline-light py-0 px-2 rounded-pill fw-semibold"
            style={{ fontSize: '0.75rem' }}
            title="Instant switch to Guest User"
          >
            <i className="bi bi-person-fill text-info me-1"></i> Guest Portal
          </button>
        </div>
      </div>

      {/* Main Navbar */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark py-2">
        <div className="container">
          {/* Brand / Logo */}
          <Link className="navbar-brand d-flex align-items-center fw-bold fs-4 text-warning" to="/">
            <i className="bi bi-buildings-fill me-2 fs-3 text-warning"></i>
            HotelPro
            <span className="badge bg-primary text-white ms-2 fs-6 fw-normal px-2 py-1 rounded-pill">
              Roomly
            </span>
          </Link>

          {/* Mobile Navbar Toggle */}
          <button
            className="navbar-toggler border-0"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarContent"
            aria-controls="navbarContent"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          {/* Nav Links */}
          <div className="collapse navbar-collapse" id="navbarContent">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0 ms-lg-3">
              <li className="nav-item">
                <NavLink
                  className={({ isActive }) =>
                    `nav-link ${isActive ? 'active text-warning fw-semibold' : ''}`
                  }
                  to="/"
                >
                  <i className="bi bi-grid-fill me-1"></i> All Rooms
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink
                  className={({ isActive }) =>
                    `nav-link ${isActive ? 'active text-warning fw-semibold' : ''}`
                  }
                  to="/user"
                >
                  <i className="bi bi-calendar2-check me-1"></i> My Bookings
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink
                  className={({ isActive }) =>
                    `nav-link ${isActive ? 'active text-warning fw-semibold' : ''}`
                  }
                  to="/admin"
                >
                  <i className="bi bi-shield-lock me-1"></i> Admin Dashboard
                </NavLink>
              </li>
            </ul>

            {/* Right-hand Auth State Actions */}
            <div className="d-flex align-items-center gap-2">
              {!isAuthenticated ? (
                <>
                  <Link to="/login" className="btn btn-outline-light btn-sm px-3 rounded-pill">
                    <i className="bi bi-box-arrow-in-right me-1"></i> Login
                  </Link>
                  <Link
                    to="/register"
                    className="btn btn-warning btn-sm px-3 rounded-pill fw-semibold text-dark"
                  >
                    <i className="bi bi-person-plus me-1"></i> Register
                  </Link>
                </>
              ) : (
                <div className="d-flex align-items-center gap-3">
                  {/* User Info Badge */}
                  <div className="text-end d-none d-sm-block">
                    <div className="text-white fw-semibold small lh-1 mb-1">{user?.name}</div>
                    <span
                      className={`badge ${
                        isAdmin ? 'bg-danger' : 'bg-info text-dark'
                      } text-uppercase px-2 py-0 rounded-pill`}
                      style={{ fontSize: '0.65rem' }}
                    >
                      {isAdmin ? 'Administrator' : 'Customer'}
                    </span>
                  </div>

                  {/* Dashboard Shortcut */}
                  <Link
                    to={isAdmin ? '/admin' : '/user'}
                    className="btn btn-outline-info btn-sm rounded-pill px-3"
                    title="Open Dashboard"
                  >
                    <i className="bi bi-person-circle me-1"></i> Dashboard
                  </Link>

                  {/* Logout Button */}
                  <button
                    onClick={handleLogout}
                    className="btn btn-outline-danger btn-sm rounded-pill px-3"
                    title="Sign out of your account"
                  >
                    <i className="bi bi-box-arrow-right me-1"></i> Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
