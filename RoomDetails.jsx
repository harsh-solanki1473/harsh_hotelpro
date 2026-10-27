// HotelPro - Room Details & Booking Page
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api, { SERVER_ORIGIN } from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/Loader';
import AlertMessage from '../components/AlertMessage';

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80';

const RoomDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState('');
  const [selectedImage, setSelectedImage] = useState('');

  // Dates
  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  const [fromdate, setFromdate] = useState(todayStr);
  const [todate, setTodate] = useState(tomorrowStr);

  // Booking Form Fields
  const [phone, setPhone] = useState('');
  const [cardholdername, setCardholdername] = useState('');
  const [cardnumber, setCardnumber] = useState('');
  const [expmonthyear, setExpmonthyear] = useState('');
  const [cvv, setCvv] = useState(''); // Mock field for UI - never stored

  // Load Room Details
  useEffect(() => {
    fetchRoomDetails();
  }, [id]);

  // Autofill user details if logged in
  useEffect(() => {
    if (user) {
      if (user.number && !phone) setPhone(user.number);
      if (user.name && !cardholdername) setCardholdername(user.name);
    }
  }, [user]);

  const fetchRoomDetails = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get(`/rooms/${id}`);
      if (response.data.success) {
        setRoom(response.data.room);
        if (response.data.room.photos && response.data.room.photos.length > 0) {
          const first = response.data.room.photos[0];
          setSelectedImage(first.startsWith('http') ? first : `${SERVER_ORIGIN}${first}`);
        } else {
          setSelectedImage(FALLBACK_IMAGE);
        }
      }
    } catch (err) {
      console.error('Fetch Room Error:', err);
      setError('Unable to find this room. It may have been removed.');
    } finally {
      setLoading(false);
    }
  };

  // Live calculation of days and amount
  const calculateTotal = () => {
    if (!room || !fromdate || !todate) return { totaldays: 0, totalAmount: 0 };
    const start = new Date(fromdate);
    const end = new Date(todate);

    if (end <= start) {
      return { totaldays: 0, totalAmount: 0 };
    }

    const diffTime = Math.abs(end - start);
    const totaldays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    const totalAmount = totaldays * room.rent;
    return { totaldays, totalAmount };
  };

  const { totaldays, totalAmount } = calculateTotal();

  // Handle Booking Submission
  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setBookingSuccess('');

    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: `/room/${id}` } } });
      return;
    }

    if (totaldays <= 0) {
      setError('Check-out date must be after check-in date.');
      return;
    }

    if (!phone || !cardholdername || !cardnumber || !expmonthyear) {
      setError('Please complete all guest contact and payment card fields.');
      return;
    }

    setBookingLoading(true);
    try {
      const payload = {
        roomid: room._id,
        fromdate: new Date(fromdate).toISOString(),
        todate: new Date(todate).toISOString(),
        phone: Number(phone),
        cardDetails: {
          cardholdername: cardholdername.trim(),
          cardnumber: cardnumber.trim(),
          expmonthyear: expmonthyear.trim(),
          // CVV is omitted
        },
      };

      const response = await api.post('/bookings/bookroom', payload);
      if (response.data.success) {
        setBookingSuccess(
          `🎉 Reservation confirmed! Booking ID: #${response.data.booking._id.slice(-6).toUpperCase()}`
        );
        // Refresh room to sync currentbooking array
        fetchRoomDetails();
        setTimeout(() => {
          navigate('/user');
        }, 2000);
      }
    } catch (err) {
      console.error('Booking Submission Failed:', err);
      setError(
        err.response?.data?.message || 'Failed to process reservation. Please check dates and try again.'
      );
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-5">
        <Loader message="Loading luxury room details..." />
      </div>
    );
  }

  if (!room) {
    return (
      <div className="container py-5 text-center">
        <div className="alert alert-warning">
          <h4>Room Not Found</h4>
          <p>The requested room could not be located.</p>
          <Link to="/" className="btn btn-primary rounded-pill">
            Return to Rooms Catalog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      {/* Breadcrumb Navigation */}
      <nav aria-label="breadcrumb" className="mb-4">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <Link to="/" className="text-decoration-none">
              Home
            </Link>
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            Room #{room.roomNumber} ({room.type})
          </li>
        </ol>
      </nav>

      {/* Alerts */}
      {error && <AlertMessage type="danger" message={error} onClose={() => setError('')} />}
      {bookingSuccess && <AlertMessage type="success" message={bookingSuccess} />}

      <div className="row g-4">
        {/* Left Column: Photos & Details */}
        <div className="col-12 col-lg-7">
          <div className="card border-0 shadow-sm rounded-4 overflow-hidden mb-4">
            {/* Main Featured Photo */}
            <div className="position-relative" style={{ height: '380px' }}>
              <img
                src={selectedImage}
                alt={`Room ${room.roomNumber}`}
                className="w-100 h-100 object-fit-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = FALLBACK_IMAGE;
                }}
              />
              <span className="position-absolute top-0 start-0 m-3 badge bg-primary fs-6 px-3 py-2 rounded-pill shadow-sm">
                {room.type}
              </span>
              <span className="position-absolute top-0 end-0 m-3 badge bg-dark bg-opacity-75 fs-6 px-3 py-2 rounded-pill shadow-sm">
                Room #{room.roomNumber}
              </span>
            </div>

            {/* Photo Gallery Thumbnails */}
            {room.photos && room.photos.length > 1 && (
              <div className="p-3 bg-light d-flex gap-2 overflow-auto">
                {room.photos.map((photo, index) => {
                  const url = photo.startsWith('http') ? photo : `${SERVER_ORIGIN}${photo}`;
                  return (
                    <img
                      key={index}
                      src={url}
                      alt={`Thumbnail ${index + 1}`}
                      className={`rounded-3 cursor-pointer object-fit-cover border-2 ${
                        selectedImage === url ? 'border-primary border' : 'opacity-75'
                      }`}
                      style={{ width: '80px', height: '60px', cursor: 'pointer' }}
                      onClick={() => setSelectedImage(url)}
                      onError={(e) => {
                        e.target.src = FALLBACK_IMAGE;
                      }}
                    />
                  );
                })}
              </div>
            )}

            {/* Room Info */}
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h3 className="fw-bold mb-0">{room.type} Suite</h3>
                <div className="text-end">
                  <span className="text-primary fw-bold fs-3">₹{room.rent.toLocaleString()}</span>
                  <span className="text-muted small"> / night</span>
                </div>
              </div>

              <h6 className="fw-bold text-dark mb-2">Description</h6>
              <p className="text-muted leading-relaxed mb-4">{room.description}</p>

              <h6 className="fw-bold text-dark mb-3">Included Amenities &amp; Highlights</h6>
              <div className="row g-2 text-secondary small">
                <div className="col-6 col-md-4">
                  <div className="p-2 border rounded bg-light d-flex align-items-center">
                    <i className="bi bi-wifi text-primary me-2 fs-5"></i> High-Speed Wi-Fi
                  </div>
                </div>
                <div className="col-6 col-md-4">
                  <div className="p-2 border rounded bg-light d-flex align-items-center">
                    <i className="bi bi-snow text-primary me-2 fs-5"></i> Air Conditioned
                  </div>
                </div>
                <div className="col-6 col-md-4">
                  <div className="p-2 border rounded bg-light d-flex align-items-center">
                    <i className="bi bi-tv text-primary me-2 fs-5"></i> Smart 4K TV
                  </div>
                </div>
                <div className="col-6 col-md-4">
                  <div className="p-2 border rounded bg-light d-flex align-items-center">
                    <i className="bi bi-cup-hot text-primary me-2 fs-5"></i> Coffee &amp; Tea Maker
                  </div>
                </div>
                <div className="col-6 col-md-4">
                  <div className="p-2 border rounded bg-light d-flex align-items-center">
                    <i className="bi bi-shield-check text-primary me-2 fs-5"></i> Electronic Safe
                  </div>
                </div>
                <div className="col-6 col-md-4">
                  <div className="p-2 border rounded bg-light d-flex align-items-center">
                    <i className="bi bi-clock-history text-primary me-2 fs-5"></i> 24/7 Room Service
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Reservation & Payment Form */}
        <div className="col-12 col-lg-5">
          <div className="card border-0 shadow-lg rounded-4 p-4 sticky-top" style={{ top: '90px' }}>
            <h4 className="fw-bold mb-3 d-flex align-items-center">
              <i className="bi bi-calendar2-check-fill text-primary me-2"></i> Reserve This Room
            </h4>

            {!isAuthenticated && (
              <div className="alert alert-info py-2 px-3 small d-flex align-items-center mb-3">
                <i className="bi bi-info-circle-fill me-2 fs-5"></i>
                <div>
                  Please{' '}
                  <Link to="/login" className="fw-bold text-decoration-underline text-primary">
                    log in
                  </Link>{' '}
                  or{' '}
                  <Link to="/register" className="fw-bold text-decoration-underline text-primary">
                    register
                  </Link>{' '}
                  to complete your reservation.
                </div>
              </div>
            )}

            <form onSubmit={handleBookingSubmit}>
              {/* Date Pickers */}
              <div className="row g-2 mb-3">
                <div className="col-6">
                  <label className="form-label fw-semibold small text-secondary">Check-In Date</label>
                  <input
                    type="date"
                    required
                    min={todayStr}
                    value={fromdate}
                    onChange={(e) => setFromdate(e.target.value)}
                    className="form-control bg-light"
                  />
                </div>
                <div className="col-6">
                  <label className="form-label fw-semibold small text-secondary">Check-Out Date</label>
                  <input
                    type="date"
                    required
                    min={fromdate || todayStr}
                    value={todate}
                    onChange={(e) => setTodate(e.target.value)}
                    className="form-control bg-light"
                  />
                </div>
              </div>

              {/* Dynamic Live Cost Calculation Box */}
              <div className="bg-light p-3 rounded-3 mb-3 border">
                <div className="d-flex justify-content-between mb-1 small text-muted">
                  <span>Rent Per Night:</span>
                  <span>₹{room.rent.toLocaleString()}</span>
                </div>
                <div className="d-flex justify-content-between mb-1 small text-muted">
                  <span>Total Duration:</span>
                  <span className="fw-semibold text-dark">
                    {totaldays > 0 ? `${totaldays} Night${totaldays > 1 ? 's' : ''}` : 'Invalid Dates'}
                  </span>
                </div>
                <div className="border-top pt-2 mt-2 d-flex justify-content-between align-items-center">
                  <span className="fw-bold text-dark">Estimated Total:</span>
                  <span className="fw-bold text-primary fs-4">
                    ₹{totalAmount > 0 ? totalAmount.toLocaleString() : 0}
                  </span>
                </div>
              </div>

              {/* Contact Information */}
              <div className="mb-3">
                <label className="form-label fw-semibold small text-secondary">Contact Phone Number</label>
                <div className="input-group">
                  <span className="input-group-text bg-light">
                    <i className="bi bi-telephone"></i>
                  </span>
                  <input
                    type="tel"
                    required
                    placeholder="10-digit phone number"
                    className="form-control bg-light"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>

              {/* Simulated Payment Card Fields */}
              <div className="border-top pt-3 mt-3 mb-3">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h6 className="fw-bold mb-0 small text-secondary">Payment Information (Simulated)</h6>
                  <span className="badge bg-success-subtle text-success small">
                    <i className="bi bi-lock-fill me-1"></i> CVV Not Stored
                  </span>
                </div>

                <div className="mb-2">
                  <label className="form-label small text-muted mb-1">Cardholder Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Name as it appears on card"
                    className="form-control form-control-sm bg-light"
                    value={cardholdername}
                    onChange={(e) => setCardholdername(e.target.value)}
                  />
                </div>

                <div className="mb-2">
                  <label className="form-label small text-muted mb-1">Card Number</label>
                  <div className="input-group input-group-sm">
                    <span className="input-group-text bg-light">
                      <i className="bi bi-credit-card"></i>
                    </span>
                    <input
                      type="text"
                      required
                      maxLength="19"
                      placeholder="4111 2222 3333 4444"
                      className="form-control bg-light"
                      value={cardnumber}
                      onChange={(e) => setCardnumber(e.target.value)}
                    />
                  </div>
                </div>

                <div className="row g-2">
                  <div className="col-6">
                    <label className="form-label small text-muted mb-1">Expiry (MM/YY)</label>
                    <input
                      type="text"
                      required
                      maxLength="5"
                      placeholder="12/28"
                      className="form-control form-control-sm bg-light"
                      value={expmonthyear}
                      onChange={(e) => setExpmonthyear(e.target.value)}
                    />
                  </div>
                  <div className="col-6">
                    <label className="form-label small text-muted mb-1">CVV (Dummy)</label>
                    <input
                      type="password"
                      maxLength="4"
                      placeholder="123"
                      className="form-control form-control-sm bg-light"
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={bookingLoading || totaldays <= 0}
                className="btn btn-primary w-100 py-3 fw-bold rounded-pill shadow-sm mt-2"
              >
                {bookingLoading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Processing Booking...
                  </>
                ) : (
                  <>
                    <i className="bi bi-check2-circle me-2"></i> Confirm &amp; Book Now
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomDetails;
