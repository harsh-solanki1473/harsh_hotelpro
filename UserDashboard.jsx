// HotelPro - User Dashboard Page
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/Loader';
import AlertMessage from '../components/AlertMessage';

const UserDashboard = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    fetchUserBookings();
  }, []);

  const fetchUserBookings = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/bookings/user');
      if (response.data.success) {
        setBookings(response.data.bookings);
      }
    } catch (err) {
      console.error('Fetch User Bookings Error:', err);
      setError('Failed to retrieve your booking history.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this room reservation?')) {
      return;
    }

    setActionLoading(true);
    setError('');
    setSuccessMsg('');
    try {
      const response = await api.put(`/bookings/cancel/${bookingId}`);
      if (response.data.success) {
        setSuccessMsg('Reservation cancelled successfully. The room is now available.');
        // Update local state
        setBookings((prev) =>
          prev.map((b) => (b._id === bookingId ? { ...b, status: 'cancelled' } : b))
        );
      }
    } catch (err) {
      console.error('Cancel Booking Error:', err);
      setError(err.response?.data?.message || 'Failed to cancel reservation.');
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const d = new Date(dateString);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="container py-5">
      {/* Header Profile Section */}
      <div className="card border-0 shadow-sm rounded-4 mb-4 overflow-hidden">
        <div className="bg-primary text-white p-4">
          <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
            <div className="d-flex align-items-center gap-3">
              <div
                className="rounded-circle bg-white text-primary d-flex align-items-center justify-content-center fw-bold fs-3 shadow-sm"
                style={{ width: '64px', height: '64px' }}
              >
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div>
                <h3 className="fw-bold mb-0">{user?.name}</h3>
                <p className="text-white-50 mb-0">{user?.email}</p>
              </div>
            </div>
            <div>
              <span className="badge bg-warning text-dark px-3 py-2 rounded-pill fw-semibold text-uppercase">
                <i className="bi bi-shield-check me-1"></i> {user?.role || 'User'}
              </span>
            </div>
          </div>
        </div>

        {/* Profile Details Bar */}
        <div className="card-body bg-light p-4">
          <div className="row g-3 text-secondary small">
            <div className="col-6 col-md-3">
              <span className="text-muted d-block">Phone Number</span>
              <strong className="text-dark fs-6">{user?.number || 'N/A'}</strong>
            </div>
            <div className="col-6 col-md-3">
              <span className="text-muted d-block">Gender</span>
              <strong className="text-dark fs-6">{user?.gender || 'N/A'}</strong>
            </div>
            <div className="col-6 col-md-3">
              <span className="text-muted d-block">Age</span>
              <strong className="text-dark fs-6">{user?.age || 'N/A'} Years</strong>
            </div>
            <div className="col-6 col-md-3">
              <span className="text-muted d-block">Total Reservations</span>
              <strong className="text-dark fs-6">{bookings.length}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Notifications */}
      {error && <AlertMessage type="danger" message={error} onClose={() => setError('')} />}
      {successMsg && <AlertMessage type="success" message={successMsg} onClose={() => setSuccessMsg('')} />}

      {/* Bookings Table Card */}
      <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
        <div className="card-header bg-white py-3 border-bottom d-flex justify-content-between align-items-center">
          <h5 className="fw-bold text-dark mb-0">
            <i className="bi bi-receipt me-2 text-primary"></i> My Booking History
          </h5>
          <Link to="/" className="btn btn-outline-primary btn-sm rounded-pill px-3">
            <i className="bi bi-plus-circle me-1"></i> Book Another Room
          </Link>
        </div>

        <div className="card-body p-0">
          {loading && <Loader message="Fetching your reservations..." />}

          {!loading && bookings.length === 0 && (
            <div className="text-center py-5">
              <i className="bi bi-calendar-x display-4 text-muted mb-3 d-block"></i>
              <h5 className="text-secondary fw-bold">No Bookings Found</h5>
              <p className="text-muted">You haven't made any hotel reservations yet.</p>
              <Link to="/" className="btn btn-primary rounded-pill px-4 mt-2">
                Browse Available Rooms
              </Link>
            </div>
          )}

          {!loading && bookings.length > 0 && (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light text-secondary small text-uppercase">
                  <tr>
                    <th scope="col" className="ps-4">
                      Booking ID
                    </th>
                    <th scope="col">Room</th>
                    <th scope="col">Dates</th>
                    <th scope="col">Duration</th>
                    <th scope="col">Total Paid</th>
                    <th scope="col">Card Used</th>
                    <th scope="col">Status</th>
                    <th scope="col" className="text-end pe-4">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((booking) => {
                    const isCancelled = booking.status === 'cancelled';
                    return (
                      <tr key={booking._id}>
                        <td className="ps-4 fw-semibold text-primary">
                          #{booking._id.slice(-6).toUpperCase()}
                        </td>
                        <td>
                          {booking.roomid ? (
                            <div>
                              <span className="fw-bold text-dark d-block">
                                Room #{booking.roomid.roomNumber}
                              </span>
                              <span className="badge bg-secondary-subtle text-secondary small">
                                {booking.roomid.type}
                              </span>
                            </div>
                          ) : (
                            <span className="text-muted fst-italic">Room Archive</span>
                          )}
                        </td>
                        <td>
                          <div className="small">
                            <div>
                              <strong className="text-muted">In:</strong> {formatDate(booking.fromdate)}
                            </div>
                            <div>
                              <strong className="text-muted">Out:</strong> {formatDate(booking.todate)}
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="badge bg-light text-dark border">
                            {booking.totaldays} Night{booking.totaldays > 1 ? 's' : ''}
                          </span>
                        </td>
                        <td>
                          <strong className="text-primary fs-6">
                            ₹{booking.totalAmount?.toLocaleString()}
                          </strong>
                        </td>
                        <td>
                          <span className="small text-muted font-monospace">
                            {booking.cardDetails?.cardnumber || '**** **** **** 1234'}
                          </span>
                        </td>
                        <td>
                          <span
                            className={`badge ${
                              isCancelled ? 'bg-secondary' : 'bg-success'
                            } text-uppercase px-2 py-1 rounded-pill`}
                          >
                            {booking.status}
                          </span>
                        </td>
                        <td className="text-end pe-4">
                          {!isCancelled ? (
                            <button
                              disabled={actionLoading}
                              onClick={() => handleCancelBooking(booking._id)}
                              className="btn btn-outline-danger btn-sm rounded-pill px-3"
                              title="Cancel this reservation"
                            >
                              <i className="bi bi-x-circle me-1"></i> Cancel
                            </button>
                          ) : (
                            <span className="text-muted small fst-italic">Cancelled</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
