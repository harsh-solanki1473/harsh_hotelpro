// HotelPro - Login Page
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import AlertMessage from '../components/AlertMessage';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!formData.email || !formData.password) {
      setError('Please fill in both email and password.');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/auth/login', {
        email: formData.email.trim(),
        password: formData.password,
      });

      if (response.data.success) {
        setSuccessMsg('Login successful! Redirecting...');
        login(response.data.token, response.data.user);
        setTimeout(() => {
          navigate(from, { replace: true });
        }, 600);
      }
    } catch (err) {
      console.error('Login Failed:', err);
      setError(
        err.response?.data?.message || 'Invalid email or password. Please verify your credentials.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Helper to quickly fill admin credentials for evaluation
  const fillAdmin = () => {
    setFormData({
      email: 'admin@hotelpro.com',
      password: 'Admin@123',
    });
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-12 col-md-8 col-lg-5">
          <div className="card shadow-lg border-0 rounded-4 overflow-hidden">
            <div className="bg-primary text-white p-4 text-center">
              <i className="bi bi-person-circle display-4 mb-2 d-block"></i>
              <h3 className="fw-bold mb-1">Welcome Back</h3>
              <p className="small text-white-50 mb-0">Sign in to manage your bookings and reservations</p>
            </div>

            <div className="card-body p-4 p-md-5">
              {error && <AlertMessage type="danger" message={error} onClose={() => setError('')} />}
              {successMsg && <AlertMessage type="success" message={successMsg} />}

              <form onSubmit={handleSubmit} noValidate>
                <div className="mb-3">
                  <label className="form-label fw-semibold text-secondary">Email Address</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light border-end-0">
                      <i className="bi bi-envelope text-muted"></i>
                    </span>
                    <input
                      type="email"
                      name="email"
                      required
                      className="form-control bg-light border-start-0"
                      placeholder="name@example.com"
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <div className="d-flex justify-content-between">
                    <label className="form-label fw-semibold text-secondary">Password</label>
                  </div>
                  <div className="input-group">
                    <span className="input-group-text bg-light border-end-0">
                      <i className="bi bi-lock text-muted"></i>
                    </span>
                    <input
                      type="password"
                      name="password"
                      required
                      className="form-control bg-light border-start-0"
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary w-100 py-2 fw-semibold rounded-pill shadow-sm"
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Signing In...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-box-arrow-in-right me-2"></i> Log In
                    </>
                  )}
                </button>
              </form>

              {/* Demo Fill Helper */}
              <div className="mt-4 pt-3 border-top text-center">
                <p className="text-muted small mb-2">College Project Quick-Fill Credentials:</p>
                <div className="d-flex justify-content-center gap-2">
                  <button
                    type="button"
                    onClick={fillAdmin}
                    className="btn btn-outline-dark btn-sm rounded-pill px-3"
                  >
                    <i className="bi bi-shield-lock me-1"></i> Use Admin Demo
                  </button>
                </div>
              </div>

              <div className="mt-4 text-center">
                <p className="text-muted small mb-0">
                  Don't have an account yet?{' '}
                  <Link to="/register" className="text-primary fw-bold text-decoration-none">
                    Create Account
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
