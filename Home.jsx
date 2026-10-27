// HotelPro (Roomly) - Unified All-in-One Home Page
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api, { SERVER_ORIGIN } from '../api/axios';
import { useAuth } from '../context/AuthContext';
import RoomCard from '../components/RoomCard';
import Loader from '../components/Loader';
import AlertMessage from '../components/AlertMessage';
import UserDashboard from './UserDashboard';
import AdminDashboard from './AdminDashboard';

const Home = () => {
  const { user, isAuthenticated, isAdmin, login } = useAuth();

  // Active Main View Tab: 'rooms' | 'book' | 'mybookings' | 'admin'
  const [activeTab, setActiveTab] = useState('rooms');

  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Search & Filter State
  const [selectedType, setSelectedType] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [maxRent, setMaxRent] = useState('');

  // Quick Booking Form State
  const [selectedRoomId, setSelectedRoomId] = useState('');
  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  const [fromdate, setFromdate] = useState(todayStr);
  const [todate, setTodate] = useState(tomorrowStr);
  const [phone, setPhone] = useState('9876543210');
  const [cardholdername, setCardholdername] = useState('Rahul Sharma');
  const [cardnumber, setCardnumber] = useState('4111 2222 3333 4444');
  const [expmonthyear, setExpmonthyear] = useState('12/28');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState('');

  // Fetch rooms on mount
  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/rooms');
      if (response.data.success) {
        setRooms(response.data.rooms);
        if (response.data.rooms.length > 0 && !selectedRoomId) {
          setSelectedRoomId(response.data.rooms[0]._id);
        }
      }
    } catch (err) {
      console.error('Failed to load rooms:', err);
      setError(
        err.response?.data?.message || 'Unable to connect to the server. Please ensure the backend is running.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Quick switch helpers
  const handleQuickLoginAdmin = async () => {
    try {
      const res = await api.post('/auth/login', {
        email: 'admin@hotelpro.com',
        password: 'Admin@123',
      });
      if (res.data.success) {
        login(res.data.token, res.data.user);
        setActiveTab('admin');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleQuickLoginUser = async () => {
    try {
      let res;
      try {
        res = await api.post('/auth/login', {
          email: 'rahul@example.com',
          password: 'Password123',
        });
      } catch (err) {
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
        setActiveTab('mybookings');
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Extract unique room types for filtering
  const roomTypes = ['All', ...new Set(rooms.map((r) => r.type).filter(Boolean))];

  // Client-side filtering
  const filteredRooms = rooms.filter((room) => {
    const matchesType = selectedType === 'All' || room.type.toLowerCase() === selectedType.toLowerCase();
    const matchesQuery =
      searchQuery === '' ||
      room.roomNumber.toString().includes(searchQuery) ||
      room.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      room.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRent = maxRent === '' || room.rent <= Number(maxRent);

    return matchesType && matchesQuery && matchesRent;
  });

  // Selected room calculation for quick booking
  const currentRoom = rooms.find((r) => r._id === selectedRoomId);
  const calculateTotal = () => {
    if (!currentRoom || !fromdate || !todate) return { totaldays: 0, totalAmount: 0 };
    const start = new Date(fromdate);
    const end = new Date(todate);
    if (end <= start) return { totaldays: 0, totalAmount: 0 };
    const diff = Math.abs(end - start);
    const totaldays = Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
    const totalAmount = totaldays * currentRoom.rent;
    return { totaldays, totalAmount };
  };
  const { totaldays, totalAmount } = calculateTotal();

  const handleQuickBookSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setBookingSuccess('');

    if (!isAuthenticated) {
      // Auto login as user for seamless demo
      await handleQuickLoginUser();
    }

    setBookingLoading(true);
    try {
      const payload = {
        roomid: selectedRoomId,
        fromdate: new Date(fromdate).toISOString(),
        todate: new Date(todate).toISOString(),
        phone: Number(phone),
        cardDetails: {
          cardholdername: cardholdername.trim(),
          cardnumber: cardnumber.trim(),
          expmonthyear: expmonthyear.trim(),
        },
      };

      const res = await api.post('/bookings/bookroom', payload);
      if (res.data.success) {
        setBookingSuccess(
          `🎉 Room #${currentRoom?.roomNumber} booked successfully! Booking ID: #${res.data.booking._id.slice(-6).toUpperCase()}`
        );
        fetchRooms();
      }
    } catch (err) {
      console.error('Quick Booking Error:', err);
      setError(err.response?.data?.message || 'Failed to complete reservation. Date conflict or server error.');
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <div className="home-page pb-5">
      {/* Hero Section */}
      <div className="bg-dark text-white py-5 position-relative overflow-hidden mb-4">
        <div
          className="position-absolute top-0 start-0 w-100 h-100 opacity-25"
          style={{
            backgroundImage:
              'url("https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1600&q=80")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        ></div>
        <div className="container position-relative py-4 text-center">
          <span className="badge bg-warning text-dark px-3 py-2 rounded-pill fw-semibold mb-3">
            ⭐ HotelPro &bull; Roomly All-in-One Experience
          </span>
          <h1 className="display-4 fw-bold mb-3">
            Luxury Hotel Booking &amp; Management <span className="text-warning">Suite</span>
          </h1>
          <p className="lead text-light max-w-700 mx-auto mb-4">
            Browse rooms, test instant reservations with dynamic price calculation, manage bookings, and access full administrative control.
          </p>

          {/* All-in-One Feature Navigation Switcher */}
          <div className="d-flex flex-wrap justify-content-center gap-2 mt-3">
            <button
              onClick={() => setActiveTab('rooms')}
              className={`btn px-4 py-2 rounded-pill fw-bold shadow-sm ${
                activeTab === 'rooms' ? 'btn-warning text-dark' : 'btn-outline-light'
              }`}
            >
              <i className="bi bi-grid-fill me-2"></i> 1. Browse All Rooms
            </button>
            <button
              onClick={() => setActiveTab('book')}
              className={`btn px-4 py-2 rounded-pill fw-bold shadow-sm ${
                activeTab === 'book' ? 'btn-warning text-dark' : 'btn-outline-light'
              }`}
            >
              <i className="bi bi-calendar2-check-fill me-2"></i> 2. Quick Book Engine
            </button>
            <button
              onClick={() => setActiveTab('mybookings')}
              className={`btn px-4 py-2 rounded-pill fw-bold shadow-sm ${
                activeTab === 'mybookings' ? 'btn-warning text-dark' : 'btn-outline-light'
              }`}
            >
              <i className="bi bi-person-circle me-2"></i> 3. Guest Portal
            </button>
            <button
              onClick={() => setActiveTab('admin')}
              className={`btn px-4 py-2 rounded-pill fw-bold shadow-sm ${
                activeTab === 'admin' ? 'btn-warning text-dark' : 'btn-outline-light'
              }`}
            >
              <i className="bi bi-shield-lock-fill me-2"></i> 4. Admin Control Panel
            </button>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="container">
        {/* Global Error & Success Alerts */}
        {error && <AlertMessage type="danger" message={error} onClose={() => setError('')} />}
        {bookingSuccess && <AlertMessage type="success" message={bookingSuccess} onClose={() => setBookingSuccess('')} />}

        {/* ========================================================= */}
        {/* VIEW TAB 1: BROWSE ALL ROOMS */}
        {/* ========================================================= */}
        {activeTab === 'rooms' && (
          <div>
            {/* Quick Filter Box */}
            <div className="card shadow-sm border-0 bg-white text-dark rounded-4 p-3 mb-4">
              <div className="row g-2 align-items-center">
                <div className="col-12 col-md-4">
                  <div className="input-group">
                    <span className="input-group-text bg-light border-0">
                      <i className="bi bi-search text-muted"></i>
                    </span>
                    <input
                      type="text"
                      className="form-control bg-light border-0"
                      placeholder="Search by keyword / room #"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>

                <div className="col-12 col-md-3">
                  <select
                    className="form-select bg-light border-0"
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                  >
                    {roomTypes.map((type) => (
                      <option key={type} value={type}>
                        Type: {type}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-12 col-md-3">
                  <div className="input-group">
                    <span className="input-group-text bg-light border-0">₹</span>
                    <input
                      type="number"
                      className="form-control bg-light border-0"
                      placeholder="Max Rent / Night"
                      value={maxRent}
                      onChange={(e) => setMaxRent(e.target.value)}
                    />
                  </div>
                </div>

                <div className="col-12 col-md-2">
                  <button
                    type="button"
                    className="btn btn-warning w-100 fw-semibold rounded-3 text-dark"
                    onClick={() => {
                      setSelectedType('All');
                      setSearchQuery('');
                      setMaxRent('');
                    }}
                  >
                    Reset
                  </button>
                </div>
              </div>
            </div>

            <div className="d-flex justify-content-between align-items-center mb-4">
              <div>
                <h3 className="fw-bold text-dark mb-0">Luxury Rooms &amp; Suites Catalog</h3>
                <p className="text-muted small mb-0">Showing {filteredRooms.length} available rooms</p>
              </div>
              <button
                onClick={() => setActiveTab('book')}
                className="btn btn-primary rounded-pill px-4 shadow-sm"
              >
                <i className="bi bi-calendar-plus me-1"></i> Quick Reserve
              </button>
            </div>

            {loading && <Loader message="Fetching luxury rooms from HotelPro catalog..." />}

            {!loading && filteredRooms.length === 0 && (
              <div className="text-center py-5 my-4 bg-light rounded-4">
                <i className="bi bi-door-closed display-3 text-muted"></i>
                <h4 className="fw-bold mt-3 text-secondary">No Rooms Match Your Criteria</h4>
                <button
                  className="btn btn-outline-primary rounded-pill px-4 mt-2"
                  onClick={() => {
                    setSelectedType('All');
                    setSearchQuery('');
                    setMaxRent('');
                  }}
                >
                  Reset Filters
                </button>
              </div>
            )}

            {!loading && filteredRooms.length > 0 && (
              <div className="row">
                {filteredRooms.map((room) => (
                  <RoomCard key={room._id} room={room} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* VIEW TAB 2: QUICK BOOK ENGINE & LIVE CALCULATOR */}
        {/* ========================================================= */}
        {activeTab === 'book' && (
          <div className="row justify-content-center">
            <div className="col-12 col-lg-8">
              <div className="card border-0 shadow-lg rounded-4 overflow-hidden mb-4">
                <div className="card-header bg-primary text-white py-3 px-4">
                  <h4 className="fw-bold mb-0">
                    <i className="bi bi-calendar2-check-fill me-2 text-warning"></i>
                    Interactive Booking Engine &amp; Cost Calculator
                  </h4>
                  <small className="text-white-50">
                    Calculates duration and total amount live with date-overlap protection
                  </small>
                </div>

                <div className="card-body p-4 p-md-5">
                  <form onSubmit={handleQuickBookSubmit}>
                    {/* Select Room */}
                    <div className="mb-3">
                      <label className="form-label fw-bold text-secondary">Select Hotel Room</label>
                      <select
                        className="form-select form-select-lg bg-light"
                        value={selectedRoomId}
                        onChange={(e) => setSelectedRoomId(e.target.value)}
                        required
                      >
                        {rooms.map((r) => (
                          <option key={r._id} value={r._id}>
                            Room #{r.roomNumber} - {r.type} (₹{r.rent?.toLocaleString()}/night)
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Room Details Highlight */}
                    {currentRoom && (
                      <div className="p-3 bg-light rounded-3 mb-4 border d-flex justify-content-between align-items-center">
                        <div>
                          <strong className="text-dark d-block">
                            Room #{currentRoom.roomNumber} &bull; {currentRoom.type}
                          </strong>
                          <span className="text-muted small">{currentRoom.description}</span>
                        </div>
                        <div className="text-end">
                          <span className="fs-4 fw-bold text-primary">₹{currentRoom.rent}</span>
                          <span className="small text-muted d-block">/ night</span>
                        </div>
                      </div>
                    )}

                    {/* Date Pickers */}
                    <div className="row g-3 mb-3">
                      <div className="col-12 col-md-6">
                        <label className="form-label fw-semibold text-secondary">Check-In Date</label>
                        <input
                          type="date"
                          required
                          min={todayStr}
                          value={fromdate}
                          onChange={(e) => setFromdate(e.target.value)}
                          className="form-control form-control-lg bg-light"
                        />
                      </div>
                      <div className="col-12 col-md-6">
                        <label className="form-label fw-semibold text-secondary">Check-Out Date</label>
                        <input
                          type="date"
                          required
                          min={fromdate || todayStr}
                          value={todate}
                          onChange={(e) => setTodate(e.target.value)}
                          className="form-control form-control-lg bg-light"
                        />
                      </div>
                    </div>

                    {/* Dynamic Cost Breakdown */}
                    <div className="bg-primary-subtle p-3 rounded-3 mb-4 border border-primary-subtle">
                      <div className="d-flex justify-content-between mb-1">
                        <span className="text-secondary">Duration:</span>
                        <strong className="text-dark">
                          {totaldays > 0 ? `${totaldays} Night${totaldays > 1 ? 's' : ''}` : 'Select valid dates'}
                        </strong>
                      </div>
                      <div className="d-flex justify-content-between mb-1">
                        <span className="text-secondary">Rate Per Night:</span>
                        <span>₹{currentRoom?.rent?.toLocaleString() || 0}</span>
                      </div>
                      <div className="border-top border-primary-subtle pt-2 mt-2 d-flex justify-content-between align-items-center">
                        <span className="fw-bold fs-5 text-dark">Calculated Total:</span>
                        <span className="fw-bold fs-3 text-primary">
                          ₹{totalAmount > 0 ? totalAmount.toLocaleString() : 0}
                        </span>
                      </div>
                    </div>

                    {/* Guest & Card Details */}
                    <h6 className="fw-bold text-secondary mb-3">Guest &amp; Card Details</h6>
                    <div className="row g-3 mb-4">
                      <div className="col-12 col-md-6">
                        <label className="form-label small text-muted">Phone Number</label>
                        <input
                          type="tel"
                          required
                          className="form-control bg-light"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                        />
                      </div>
                      <div className="col-12 col-md-6">
                        <label className="form-label small text-muted">Cardholder Name</label>
                        <input
                          type="text"
                          required
                          className="form-control bg-light"
                          value={cardholdername}
                          onChange={(e) => setCardholdername(e.target.value)}
                        />
                      </div>
                      <div className="col-12 col-md-8">
                        <label className="form-label small text-muted">Card Number (Masked)</label>
                        <input
                          type="text"
                          required
                          className="form-control bg-light font-monospace"
                          value={cardnumber}
                          onChange={(e) => setCardnumber(e.target.value)}
                        />
                      </div>
                      <div className="col-12 col-md-4">
                        <label className="form-label small text-muted">Expiry (MM/YY)</label>
                        <input
                          type="text"
                          required
                          className="form-control bg-light"
                          value={expmonthyear}
                          onChange={(e) => setExpmonthyear(e.target.value)}
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={bookingLoading || totaldays <= 0}
                      className="btn btn-warning w-100 py-3 fw-bold rounded-pill text-dark shadow-sm fs-5"
                    >
                      {bookingLoading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                          Confirming Booking...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-shield-check me-2"></i> Confirm Instant Booking
                        </>
                      )}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* VIEW TAB 3: CUSTOMER PORTAL */}
        {/* ========================================================= */}
        {activeTab === 'mybookings' && (
          <div>
            {!isAuthenticated ? (
              <div className="text-center py-5 bg-white rounded-4 shadow-sm p-4">
                <i className="bi bi-person-lock display-3 text-muted mb-3 d-block"></i>
                <h4 className="fw-bold">Sign In to View Your Reservations</h4>
                <p className="text-muted">You can test the guest portal instantly with one click:</p>
                <button
                  onClick={handleQuickLoginUser}
                  className="btn btn-primary px-4 py-2 rounded-pill fw-semibold shadow-sm"
                >
                  <i className="bi bi-person-check me-2"></i> Instant Guest Sign-In (Rahul Sharma)
                </button>
                <div className="mt-3">
                  <Link to="/login" className="text-muted small text-decoration-underline">
                    Or log in with existing credentials
                  </Link>
                </div>
              </div>
            ) : (
              <UserDashboard />
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* VIEW TAB 4: ADMIN CONTROL PANEL */}
        {/* ========================================================= */}
        {activeTab === 'admin' && (
          <div>
            {!isAdmin ? (
              <div className="text-center py-5 bg-white rounded-4 shadow-sm p-4">
                <i className="bi bi-shield-lock display-3 text-danger mb-3 d-block"></i>
                <h4 className="fw-bold">Administrator Access Required</h4>
                <p className="text-muted">
                  Log in as an administrator to manage rooms, view all customer bookings, and oversee users.
                </p>
                <button
                  onClick={handleQuickLoginAdmin}
                  className="btn btn-danger px-4 py-2 rounded-pill fw-semibold shadow-sm"
                >
                  <i className="bi bi-shield-fill-check me-2"></i> Instant Admin Login (admin@hotelpro.com)
                </button>
                <div className="mt-3">
                  <Link to="/login" className="text-muted small text-decoration-underline">
                    Or go to Login page
                  </Link>
                </div>
              </div>
            ) : (
              <AdminDashboard />
            )}
          </div>
        )}

        {/* Amenities Highlights Footer */}
        <div className="mt-5 pt-4 border-top">
          <div className="text-center mb-4">
            <h4 className="fw-bold">Why Guests Choose Roomly</h4>
            <p className="text-muted small">College MERN Stack Hotel Reservation &amp; Inventory Management System</p>
          </div>
          <div className="row g-4 text-center">
            <div className="col-6 col-md-3">
              <div className="p-3 bg-white rounded-3 shadow-sm border">
                <i className="bi bi-shield-lock-fill text-primary fs-2 mb-2 d-block"></i>
                <h6 className="fw-bold mb-1">Masked Security</h6>
                <p className="text-muted small mb-0">CVV strictly discarded &amp; cards masked.</p>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="p-3 bg-white rounded-3 shadow-sm border">
                <i className="bi bi-calendar2-range text-warning fs-2 mb-2 d-block"></i>
                <h6 className="fw-bold mb-1">Conflict Detection</h6>
                <p className="text-muted small mb-0">Rejects double-booking on overlapping dates.</p>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="p-3 bg-white rounded-3 shadow-sm border">
                <i className="bi bi-cpu-fill text-success fs-2 mb-2 d-block"></i>
                <h6 className="fw-bold mb-1">Server Calculated</h6>
                <p className="text-muted small mb-0">Total cost is computed on backend.</p>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="p-3 bg-white rounded-3 shadow-sm border">
                <i className="bi bi-people-fill text-danger fs-2 mb-2 d-block"></i>
                <h6 className="fw-bold mb-1">Dual-Role Portal</h6>
                <p className="text-muted small mb-0">Customer &amp; Admin unified views.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
