// HotelPro (Roomly) - Comprehensive Admin Dashboard
import React, { useState, useEffect } from 'react';
import api, { SERVER_ORIGIN } from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/Loader';
import AlertMessage from '../components/AlertMessage';

const AdminDashboard = () => {
  const { user } = useAuth();

  // Active Tab: 'bookings' | 'rooms' | 'addroom' | 'users'
  const [activeTab, setActiveTab] = useState('bookings');

  // Data States
  const [bookings, setBookings] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [users, setUsers] = useState([]);

  // Loaders & Feedback
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Add Room Form State
  const [newRoom, setNewRoom] = useState({
    roomNumber: '',
    count: 1,
    rent: '',
    type: 'Deluxe',
    description: '',
  });
  const [selectedPhotos, setSelectedPhotos] = useState([]);

  // Edit Room Modal State
  const [editingRoom, setEditingRoom] = useState(null);

  // Load initial data based on active tab
  useEffect(() => {
    if (activeTab === 'bookings') fetchBookings();
    if (activeTab === 'rooms') fetchRooms();
    if (activeTab === 'users') fetchUsers();
  }, [activeTab]);

  // =====================================
  // API DATA FETCHERS
  // =====================================
  const fetchBookings = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/bookings');
      if (res.data.success) {
        setBookings(res.data.bookings);
      }
    } catch (err) {
      console.error('Fetch Admin Bookings Error:', err);
      setError('Failed to fetch bookings list.');
    } finally {
      setLoading(false);
    }
  };

  const fetchRooms = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/rooms');
      if (res.data.success) {
        setRooms(res.data.rooms);
      }
    } catch (err) {
      console.error('Fetch Admin Rooms Error:', err);
      setError('Failed to fetch rooms list.');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/users');
      if (res.data.success) {
        setUsers(res.data.users);
      }
    } catch (err) {
      console.error('Fetch Users Error:', err);
      setError('Failed to fetch registered users.');
    } finally {
      setLoading(false);
    }
  };

  // =====================================
  // ROOM ACTIONS
  // =====================================
  const handleAddRoomChange = (e) => {
    setNewRoom({
      ...newRoom,
      [e.target.name]: e.target.value,
    });
  };

  const handlePhotoUpload = (e) => {
    if (e.target.files) {
      setSelectedPhotos(Array.from(e.target.files));
    }
  };

  const handleAddRoomSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!newRoom.roomNumber || !newRoom.rent || !newRoom.description) {
      setError('Please provide room number, rent, and description.');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('roomNumber', newRoom.roomNumber);
      formData.append('count', newRoom.count);
      formData.append('rent', newRoom.rent);
      formData.append('type', newRoom.type);
      formData.append('description', newRoom.description);

      // Append selected photo files
      for (let i = 0; i < selectedPhotos.length; i++) {
        formData.append('photos', selectedPhotos[i]);
      }

      const res = await api.post('/rooms/addroom', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (res.data.success) {
        setSuccessMsg(`Room #${newRoom.roomNumber} added successfully!`);
        setNewRoom({
          roomNumber: '',
          count: 1,
          rent: '',
          type: 'Deluxe',
          description: '',
        });
        setSelectedPhotos([]);
        // Reset file input
        const fileInput = document.getElementById('roomPhotosInput');
        if (fileInput) fileInput.value = '';
        setActiveTab('rooms');
      }
    } catch (err) {
      console.error('Add Room Failed:', err);
      setError(err.response?.data?.message || 'Failed to add room.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRoom = async (roomId, roomNumber) => {
    if (!window.confirm(`Are you sure you want to permanently delete Room #${roomNumber}?`)) {
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await api.delete(`/rooms/${roomId}`);
      if (res.data.success) {
        setSuccessMsg(res.data.message);
        setRooms((prev) => prev.filter((r) => r._id !== roomId));
      }
    } catch (err) {
      console.error('Delete Room Failed:', err);
      setError(err.response?.data?.message || 'Failed to delete room.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRoomSubmit = async (e) => {
    e.preventDefault();
    if (!editingRoom) return;

    setLoading(true);
    setError('');
    setSuccessMsg('');
    try {
      const res = await api.put(`/rooms/${editingRoom._id}`, {
        roomNumber: editingRoom.roomNumber,
        count: editingRoom.count,
        rent: editingRoom.rent,
        type: editingRoom.type,
        description: editingRoom.description,
      });

      if (res.data.success) {
        setSuccessMsg(`Room #${editingRoom.roomNumber} updated successfully!`);
        setRooms((prev) => prev.map((r) => (r._id === editingRoom._id ? res.data.room : r)));
        setEditingRoom(null);
      }
    } catch (err) {
      console.error('Update Room Failed:', err);
      setError(err.response?.data?.message || 'Failed to update room.');
    } finally {
      setLoading(false);
    }
  };

  // =====================================
  // BOOKING ACTIONS
  // =====================================
  const handleAdminCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking as Administrator?')) {
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await api.put(`/bookings/cancel/${bookingId}`);
      if (res.data.success) {
        setSuccessMsg(res.data.message);
        setBookings((prev) =>
          prev.map((b) => (b._id === bookingId ? { ...b, status: 'cancelled' } : b))
        );
      }
    } catch (err) {
      console.error('Admin Cancel Error:', err);
      setError(err.response?.data?.message || 'Failed to cancel reservation.');
    } finally {
      setLoading(false);
    }
  };

  // =====================================
  // USER ACTIONS
  // =====================================
  const handleDeleteUser = async (userId, userName) => {
    if (userId === user._id) {
      alert('Security Protection: You cannot delete your currently active administrator account.');
      return;
    }

    if (!window.confirm(`Are you sure you want to remove user "${userName}"?`)) {
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await api.delete(`/users/${userId}`);
      if (res.data.success) {
        setSuccessMsg(res.data.message);
        setUsers((prev) => prev.filter((u) => u._id !== userId));
      }
    } catch (err) {
      console.error('Delete User Failed:', err);
      setError(err.response?.data?.message || 'Failed to delete user.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="container-fluid py-4 px-md-5">
      {/* Dashboard Top Title Bar */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 pb-2 border-bottom">
        <div>
          <h2 className="fw-bold text-dark mb-0 d-flex align-items-center">
            <i className="bi bi-shield-lock-fill text-danger me-2"></i>
            HotelPro Administrator Control Panel
          </h2>
          <p className="text-muted small mb-0">
            Real-time management for reservations, room inventory, and registered guests
          </p>
        </div>
        <div className="d-flex align-items-center gap-2 mt-2 mt-md-0">
          <span className="badge bg-danger-subtle text-danger px-3 py-2 rounded-pill fw-semibold">
            Logged in as {user?.name}
          </span>
        </div>
      </div>

      {/* Global Alerts */}
      {error && <AlertMessage type="danger" message={error} onClose={() => setError('')} />}
      {successMsg && <AlertMessage type="success" message={successMsg} onClose={() => setSuccessMsg('')} />}

      {/* Navigation Tabs */}
      <ul className="nav nav-pills mb-4 gap-2 bg-white p-2 rounded-4 shadow-sm border">
        <li className="nav-item">
          <button
            className={`nav-link rounded-pill fw-semibold px-4 ${
              activeTab === 'bookings' ? 'active bg-primary' : 'text-secondary'
            }`}
            onClick={() => setActiveTab('bookings')}
          >
            <i className="bi bi-calendar2-check me-2"></i>
            Bookings ({bookings.length})
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link rounded-pill fw-semibold px-4 ${
              activeTab === 'rooms' ? 'active bg-primary' : 'text-secondary'
            }`}
            onClick={() => setActiveTab('rooms')}
          >
            <i className="bi bi-door-open me-2"></i>
            Rooms Catalog ({rooms.length})
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link rounded-pill fw-semibold px-4 ${
              activeTab === 'addroom' ? 'active bg-success text-white' : 'text-secondary'
            }`}
            onClick={() => setActiveTab('addroom')}
          >
            <i className="bi bi-plus-circle me-2"></i>
            Add New Room
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link rounded-pill fw-semibold px-4 ${
              activeTab === 'users' ? 'active bg-primary' : 'text-secondary'
            }`}
            onClick={() => setActiveTab('users')}
          >
            <i className="bi bi-people me-2"></i>
            Users ({users.length})
          </button>
        </li>
      </ul>

      {/* Tab Loading Indicator */}
      {loading && <Loader message="Updating administrative database records..." />}

      {/* ===================================== */}
      {/* TAB 1: ALL BOOKINGS */}
      {/* ===================================== */}
      {!loading && activeTab === 'bookings' && (
        <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
          <div className="card-header bg-white py-3 border-bottom d-flex justify-content-between align-items-center">
            <h5 className="fw-bold mb-0 text-dark">
              <i className="bi bi-receipt me-2 text-primary"></i> All Hotel Bookings
            </h5>
            <button onClick={fetchBookings} className="btn btn-outline-secondary btn-sm rounded-pill px-3">
              <i className="bi bi-arrow-clockwise me-1"></i> Refresh
            </button>
          </div>

          <div className="card-body p-0">
            {bookings.length === 0 ? (
              <div className="text-center py-5 text-muted">No reservations booked yet.</div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light text-secondary small text-uppercase">
                    <tr>
                      <th className="ps-4">Booking ID</th>
                      <th>Guest Details</th>
                      <th>Room</th>
                      <th>Dates</th>
                      <th>Duration</th>
                      <th>Amount</th>
                      <th>Payment Card</th>
                      <th>Status</th>
                      <th className="text-end pe-4">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((b) => {
                      const isCancelled = b.status === 'cancelled';
                      return (
                        <tr key={b._id}>
                          <td className="ps-4 fw-semibold text-primary font-monospace">
                            #{b._id.slice(-6).toUpperCase()}
                          </td>
                          <td>
                            <strong className="d-block text-dark">{b.username}</strong>
                            <small className="text-muted">{b.userid?.email || 'N/A'}</small>
                            <small className="text-muted d-block">Ph: {b.phone}</small>
                          </td>
                          <td>
                            {b.roomid ? (
                              <div>
                                <strong className="text-dark">Room #{b.roomid.roomNumber}</strong>
                                <span className="d-block small text-muted">{b.roomid.type}</span>
                              </div>
                            ) : (
                              <span className="text-muted fst-italic">Room archived</span>
                            )}
                          </td>
                          <td className="small">
                            <div>
                              <strong className="text-muted">In:</strong> {formatDate(b.fromdate)}
                            </div>
                            <div>
                              <strong className="text-muted">Out:</strong> {formatDate(b.todate)}
                            </div>
                          </td>
                          <td>
                            <span className="badge bg-light text-dark border">
                              {b.totaldays} Night{b.totaldays > 1 ? 's' : ''}
                            </span>
                          </td>
                          <td>
                            <strong className="text-success fs-6">₹{b.totalAmount?.toLocaleString()}</strong>
                          </td>
                          <td className="small font-monospace text-muted">
                            {b.cardDetails?.cardnumber || '**** **** **** 1234'}
                          </td>
                          <td>
                            <span
                              className={`badge ${
                                isCancelled ? 'bg-secondary' : 'bg-success'
                              } text-uppercase px-2 py-1 rounded-pill`}
                            >
                              {b.status}
                            </span>
                          </td>
                          <td className="text-end pe-4">
                            {!isCancelled ? (
                              <button
                                onClick={() => handleAdminCancelBooking(b._id)}
                                className="btn btn-outline-danger btn-sm rounded-pill px-3"
                                title="Cancel reservation"
                              >
                                Cancel
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
      )}

      {/* ===================================== */}
      {/* TAB 2: ROOMS CATALOG */}
      {/* ===================================== */}
      {!loading && activeTab === 'rooms' && (
        <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
          <div className="card-header bg-white py-3 border-bottom d-flex justify-content-between align-items-center">
            <h5 className="fw-bold mb-0 text-dark">
              <i className="bi bi-door-open me-2 text-primary"></i> Hotel Rooms Inventory
            </h5>
            <button
              onClick={() => setActiveTab('addroom')}
              className="btn btn-success btn-sm rounded-pill px-3"
            >
              <i className="bi bi-plus-circle me-1"></i> Add Room
            </button>
          </div>

          <div className="card-body p-0">
            {rooms.length === 0 ? (
              <div className="text-center py-5 text-muted">
                No rooms in catalog. Click "Add New Room" to create one.
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light text-secondary small text-uppercase">
                    <tr>
                      <th className="ps-4">Preview</th>
                      <th>Room #</th>
                      <th>Type</th>
                      <th>Rent / Night</th>
                      <th>Capacity / Count</th>
                      <th>Active Bookings</th>
                      <th>Description</th>
                      <th className="text-end pe-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rooms.map((r) => {
                      const photoUrl =
                        r.photos && r.photos.length > 0
                          ? r.photos[0].startsWith('http')
                            ? r.photos[0]
                            : `${SERVER_ORIGIN}${r.photos[0]}`
                          : 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=150&q=80';

                      const activeBookingsCount =
                        r.currentbooking?.filter((cb) => cb.status === 'booked').length || 0;

                      return (
                        <tr key={r._id}>
                          <td className="ps-4">
                            <img
                              src={photoUrl}
                              alt={`Room ${r.roomNumber}`}
                              className="rounded-3 object-fit-cover shadow-sm"
                              style={{ width: '60px', height: '45px' }}
                              onError={(e) => {
                                e.target.src =
                                  'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=150&q=80';
                              }}
                            />
                          </td>
                          <td className="fw-bold text-dark">#{r.roomNumber}</td>
                          <td>
                            <span className="badge bg-primary-subtle text-primary">{r.type}</span>
                          </td>
                          <td>
                            <strong className="text-dark">₹{r.rent?.toLocaleString()}</strong>
                          </td>
                          <td>{r.count} Unit(s)</td>
                          <td>
                            <span
                              className={`badge ${
                                activeBookingsCount > 0 ? 'bg-warning text-dark' : 'bg-success-subtle text-success'
                              } rounded-pill`}
                            >
                              {activeBookingsCount} Active
                            </span>
                          </td>
                          <td className="small text-muted" style={{ maxWidth: '240px' }}>
                            <div className="text-truncate">{r.description}</div>
                          </td>
                          <td className="text-end pe-4">
                            <div className="btn-group">
                              <button
                                onClick={() => setEditingRoom(r)}
                                className="btn btn-outline-primary btn-sm rounded-start-pill px-3"
                                title="Edit room details"
                              >
                                <i className="bi bi-pencil-square me-1"></i> Edit
                              </button>
                              <button
                                onClick={() => handleDeleteRoom(r._id, r.roomNumber)}
                                className="btn btn-outline-danger btn-sm rounded-end-pill px-3"
                                title="Delete room"
                              >
                                <i className="bi bi-trash me-1"></i> Delete
                              </button>
                            </div>
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
      )}

      {/* ===================================== */}
      {/* TAB 3: ADD NEW ROOM */}
      {/* ===================================== */}
      {!loading && activeTab === 'addroom' && (
        <div className="row justify-content-center">
          <div className="col-12 col-lg-8">
            <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
              <div className="card-header bg-dark text-white py-3">
                <h5 className="fw-bold mb-0">
                  <i className="bi bi-plus-circle text-warning me-2"></i> Register New Hotel Room
                </h5>
              </div>

              <div className="card-body p-4 p-md-5">
                <form onSubmit={handleAddRoomSubmit} encType="multipart/form-data">
                  <div className="row g-3">
                    <div className="col-12 col-md-6">
                      <label className="form-label fw-semibold text-secondary">Room Number</label>
                      <input
                        type="number"
                        name="roomNumber"
                        required
                        className="form-control bg-light"
                        placeholder="e.g. 101, 204"
                        value={newRoom.roomNumber}
                        onChange={handleAddRoomChange}
                      />
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label fw-semibold text-secondary">Room Type</label>
                      <select
                        name="type"
                        className="form-select bg-light"
                        value={newRoom.type}
                        onChange={handleAddRoomChange}
                      >
                        <option value="Standard">Standard</option>
                        <option value="Deluxe">Deluxe</option>
                        <option value="Super Deluxe">Super Deluxe</option>
                        <option value="Executive Suite">Executive Suite</option>
                        <option value="Presidential Suite">Presidential Suite</option>
                      </select>
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label fw-semibold text-secondary">Rent (Per Night in ₹)</label>
                      <div className="input-group">
                        <span className="input-group-text bg-light">₹</span>
                        <input
                          type="number"
                          name="rent"
                          required
                          className="form-control bg-light"
                          placeholder="e.g. 2500"
                          value={newRoom.rent}
                          onChange={handleAddRoomChange}
                        />
                      </div>
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label fw-semibold text-secondary">Room Units / Capacity</label>
                      <input
                        type="number"
                        name="count"
                        min="1"
                        required
                        className="form-control bg-light"
                        placeholder="e.g. 1"
                        value={newRoom.count}
                        onChange={handleAddRoomChange}
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label fw-semibold text-secondary">Room Description</label>
                      <textarea
                        name="description"
                        rows="3"
                        required
                        className="form-control bg-light"
                        placeholder="Highlight bed size, views, bathroom, and services provided..."
                        value={newRoom.description}
                        onChange={handleAddRoomChange}
                      ></textarea>
                    </div>

                    <div className="col-12">
                      <label className="form-label fw-semibold text-secondary">
                        Room Photos (Multiple files supported via Multer)
                      </label>
                      <input
                        id="roomPhotosInput"
                        type="file"
                        multiple
                        accept="image/png, image/jpeg, image/jpg, image/webp"
                        className="form-control bg-light"
                        onChange={handlePhotoUpload}
                      />
                      <small className="text-muted">
                        Select up to 5 photos (.jpg, .jpeg, .png, .webp).
                      </small>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-top d-flex gap-3">
                    <button
                      type="submit"
                      disabled={loading}
                      className="btn btn-success px-4 py-2 rounded-pill fw-semibold shadow-sm"
                    >
                      <i className="bi bi-cloud-arrow-up me-2"></i> Save &amp; Publish Room
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('rooms')}
                      className="btn btn-outline-secondary px-4 py-2 rounded-pill"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================================== */}
      {/* TAB 4: USERS MANAGEMENT */}
      {/* ===================================== */}
      {!loading && activeTab === 'users' && (
        <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
          <div className="card-header bg-white py-3 border-bottom d-flex justify-content-between align-items-center">
            <h5 className="fw-bold mb-0 text-dark">
              <i className="bi bi-people me-2 text-primary"></i> Registered Users Directory
            </h5>
            <button onClick={fetchUsers} className="btn btn-outline-secondary btn-sm rounded-pill px-3">
              <i className="bi bi-arrow-clockwise me-1"></i> Refresh
            </button>
          </div>

          <div className="card-body p-0">
            {users.length === 0 ? (
              <div className="text-center py-5 text-muted">No registered users found.</div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light text-secondary small text-uppercase">
                    <tr>
                      <th className="ps-4">User</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Gender &amp; Age</th>
                      <th>Role</th>
                      <th>Registered On</th>
                      <th className="text-end pe-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => {
                      const isSelf = u._id === user._id;
                      return (
                        <tr key={u._id}>
                          <td className="ps-4">
                            <div className="d-flex align-items-center gap-2">
                              <div
                                className="rounded-circle bg-primary-subtle text-primary fw-bold d-flex align-items-center justify-content-center"
                                style={{ width: '38px', height: '38px' }}
                              >
                                {u.name ? u.name.charAt(0).toUpperCase() : 'U'}
                              </div>
                              <span className="fw-bold text-dark">{u.name}</span>
                            </div>
                          </td>
                          <td className="text-secondary">{u.email}</td>
                          <td>{u.number}</td>
                          <td>
                            {u.gender}, {u.age} yrs
                          </td>
                          <td>
                            <span
                              className={`badge ${
                                u.role === 'admin' ? 'bg-danger' : 'bg-primary'
                              } text-uppercase px-2 py-1 rounded-pill`}
                            >
                              {u.role}
                            </span>
                          </td>
                          <td className="small text-muted">{formatDate(u.createdAt)}</td>
                          <td className="text-end pe-4">
                            {isSelf ? (
                              <span className="badge bg-light text-muted border">Current Admin</span>
                            ) : (
                              <button
                                onClick={() => handleDeleteUser(u._id, u.name)}
                                className="btn btn-outline-danger btn-sm rounded-pill px-3"
                                title="Remove user"
                              >
                                <i className="bi bi-trash me-1"></i> Delete
                              </button>
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
      )}

      {/* ===================================== */}
      {/* EDIT ROOM MODAL */}
      {/* ===================================== */}
      {editingRoom && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 rounded-4 shadow-lg overflow-hidden">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title fw-bold">Edit Room #{editingRoom.roomNumber}</h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setEditingRoom(null)}
                ></button>
              </div>
              <form onSubmit={handleUpdateRoomSubmit}>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-secondary">Room Number</label>
                    <input
                      type="number"
                      required
                      className="form-control"
                      value={editingRoom.roomNumber}
                      onChange={(e) =>
                        setEditingRoom({ ...editingRoom, roomNumber: e.target.value })
                      }
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-secondary">Room Type</label>
                    <input
                      type="text"
                      required
                      className="form-control"
                      value={editingRoom.type}
                      onChange={(e) => setEditingRoom({ ...editingRoom, type: e.target.value })}
                    />
                  </div>

                  <div className="row g-2 mb-3">
                    <div className="col-6">
                      <label className="form-label small fw-semibold text-secondary">Rent / Night (₹)</label>
                      <input
                        type="number"
                        required
                        className="form-control"
                        value={editingRoom.rent}
                        onChange={(e) => setEditingRoom({ ...editingRoom, rent: e.target.value })}
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-semibold text-secondary">Capacity / Units</label>
                      <input
                        type="number"
                        required
                        className="form-control"
                        value={editingRoom.count}
                        onChange={(e) => setEditingRoom({ ...editingRoom, count: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-secondary">Description</label>
                    <textarea
                      rows="3"
                      required
                      className="form-control"
                      value={editingRoom.description}
                      onChange={(e) =>
                        setEditingRoom({ ...editingRoom, description: e.target.value })
                      }
                    ></textarea>
                  </div>
                </div>

                <div className="modal-footer bg-light">
                  <button
                    type="button"
                    className="btn btn-outline-secondary rounded-pill px-4"
                    onClick={() => setEditingRoom(null)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary rounded-pill px-4 fw-semibold">
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
