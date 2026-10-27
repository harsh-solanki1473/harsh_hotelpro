// HotelPro - Register Page
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import AlertMessage from '../components/AlertMessage';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    number: '',
    email: '',
    password: '',
    confirmPassword: '',
    gender: 'Male',
    age: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const navigate = useNavigate();

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

    // Validation
    if (!formData.name || !formData.number || !formData.email || !formData.password || !formData.age) {
      setError('Please fill in all required registration fields.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must contain at least 6 characters.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }

    if (Number(formData.age) < 18) {
      setError('Guests must be at least 18 years old to make reservations.');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/auth/register', {
        name: formData.name.trim(),
        number: formData.number.trim(),
        email: formData.email.trim(),
        password: formData.password,
        gender: formData.gender,
        age: Number(formData.age),
      });

      if (response.data.success) {
        setSuccessMsg('Registration successful! Redirecting to login page...');
        setTimeout(() => {
          navigate('/login');
        }, 1200);
      }
    } catch (err) {
      console.error('Registration failed:', err);
      setError(
        err.response?.data?.message || 'Failed to complete registration. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-12 col-md-10 col-lg-7">
          <div className="card shadow-lg border-0 rounded-4 overflow-hidden">
            <div className="bg-dark text-white p-4 text-center">
              <i className="bi bi-person-plus-fill text-warning display-4 mb-2 d-block"></i>
              <h3 className="fw-bold mb-1">Create Your Guest Account</h3>
              <p className="small text-white-50 mb-0">Join HotelPro for exclusive rates and rapid bookings</p>
            </div>

            <div className="card-body p-4 p-md-5">
              {error && <AlertMessage type="danger" message={error} onClose={() => setError('')} />}
              {successMsg && <AlertMessage type="success" message={successMsg} />}

              <form onSubmit={handleSubmit} noValidate>
                <div className="row g-3">
                  {/* Full Name */}
                  <div className="col-12 col-md-6">
                    <label className="form-label fw-semibold text-secondary">Full Name</label>
                    <input
                      type="text"
                      name="name"
                      required
                      className="form-control bg-light"
                      placeholder="e.g. John Doe"
                      value={formData.name}
                      onChange={handleChange}
                    />
                  </div>

                  {/* Contact Number */}
                  <div className="col-12 col-md-6">
                    <label className="form-label fw-semibold text-secondary">Phone Number</label>
                    <input
                      type="tel"
                      name="number"
                      required
                      className="form-control bg-light"
                      placeholder="e.g. 9876543210"
                      value={formData.number}
                      onChange={handleChange}
                    />
                  </div>

                  {/* Email */}
                  <div className="col-12">
                    <label className="form-label fw-semibold text-secondary">Email Address</label>
                    <input
                      type="email"
                      name="email"
                      required
                      className="form-control bg-light"
                      placeholder="e.g. john@example.com"
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>

                  {/* Gender */}
                  <div className="col-12 col-md-6">
                    <label className="form-label fw-semibold text-secondary">Gender</label>
                    <select
                      name="gender"
                      className="form-select bg-light"
                      value={formData.gender}
                      onChange={handleChange}
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  {/* Age */}
                  <div className="col-12 col-md-6">
                    <label className="form-label fw-semibold text-secondary">Age</label>
                    <input
                      type="number"
                      name="age"
                      min="18"
                      max="120"
                      required
                      className="form-control bg-light"
                      placeholder="Minimum age 18"
                      value={formData.age}
                      onChange={handleChange}
                    />
                  </div>

                  {/* Password */}
                  <div className="col-12 col-md-6">
                    <label className="form-label fw-semibold text-secondary">Password</label>
                    <input
                      type="password"
                      name="password"
                      required
                      className="form-control bg-light"
                      placeholder="At least 6 characters"
                      value={formData.password}
                      onChange={handleChange}
                    />
                  </div>

                  {/* Confirm Password */}
                  <div className="col-12 col-md-6">
                    <label className="form-label fw-semibold text-secondary">Confirm Password</label>
                    <input
                      type="password"
                      name="confirmPassword"
                      required
                      className="form-control bg-light"
                      placeholder="Repeat password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-warning w-100 py-2 fw-semibold text-dark rounded-pill shadow-sm"
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Registering Account...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-person-check me-2"></i> Register Account
                      </>
                    )}
                  </button>
                </div>
              </form>

              <div className="mt-4 text-center">
                <p className="text-muted small mb-0">
                  Already have an account?{' '}
                  <Link to="/login" className="text-primary fw-bold text-decoration-none">
                    Log in here
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

export default Register;
