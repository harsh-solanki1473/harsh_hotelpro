// HotelPro - Room Card Component
import React from 'react';
import { Link } from 'react-router-dom';
import { SERVER_ORIGIN } from '../api/axios';

// Default modern hotel room image fallback
const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80';

const RoomCard = ({ room }) => {
  // Resolve image source URL
  const getImageSrc = () => {
    if (room.photos && room.photos.length > 0) {
      const firstPhoto = room.photos[0];
      if (firstPhoto.startsWith('http://') || firstPhoto.startsWith('https://')) {
        return firstPhoto;
      }
      return `${SERVER_ORIGIN}${firstPhoto}`;
    }
    return FALLBACK_IMAGE;
  };

  return (
    <div className="col-12 col-md-6 col-lg-4 mb-4">
      <div className="card h-100 shadow-sm border-0 room-card overflow-hidden transition-all">
        {/* Photo with Overlay Badges */}
        <div className="position-relative overflow-hidden" style={{ height: '220px' }}>
          <img
            src={getImageSrc()}
            alt={`Room ${room.roomNumber}`}
            className="w-100 h-100 object-fit-cover room-card-img"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = FALLBACK_IMAGE;
            }}
          />
          {/* Room Type Badge */}
          <span className="position-absolute top-0 start-0 m-3 badge bg-primary px-3 py-2 rounded-pill shadow-sm">
            {room.type}
          </span>
          {/* Room Number Badge */}
          <span className="position-absolute top-0 end-0 m-3 badge bg-dark bg-opacity-75 text-white px-3 py-2 rounded-pill shadow-sm">
            Room #{room.roomNumber}
          </span>
        </div>

        {/* Card Body */}
        <div className="card-body d-flex flex-column p-4">
          <div className="d-flex justify-content-between align-items-baseline mb-2">
            <h5 className="card-title fw-bold text-dark mb-0">{room.type}</h5>
            <span className="text-primary fw-bold fs-5">
              ₹{room.rent.toLocaleString()}
              <small className="text-muted fs-6 fw-normal"> / night</small>
            </span>
          </div>

          <p className="card-text text-muted small flex-grow-1 mb-3">
            {room.description && room.description.length > 110
              ? `${room.description.substring(0, 110)}...`
              : room.description || 'Experience comfort and exceptional service.'}
          </p>

          <div className="d-flex align-items-center gap-3 text-secondary small mb-3 border-top pt-3">
            <span>
              <i className="bi bi-people me-1 text-primary"></i> Max: {room.count * 2 || 2} Guests
            </span>
            <span>
              <i className="bi bi-wifi me-1 text-primary"></i> Free Wi-Fi
            </span>
            <span>
              <i className="bi bi-shield-check me-1 text-primary"></i> AC & TV
            </span>
          </div>

          <Link
            to={`/room/${room._id}`}
            className="btn btn-primary w-100 py-2 fw-semibold rounded-pill d-flex align-items-center justify-content-center shadow-sm"
          >
            <span>View &amp; Book</span>
            <i className="bi bi-arrow-right ms-2"></i>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RoomCard;
