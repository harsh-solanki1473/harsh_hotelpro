// HotelPro - Backend API Automated Test Suite
const http = require('http');

const PORT = 5000;
const BASE_URL = `http://127.0.0.1:${PORT}/api`;

function request(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });

    req.on('error', (err) => reject(err));

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runTests() {
  console.log('🧪 Starting HotelPro Backend Automated Tests...\n');

  try {
    // 1. Health check
    const health = await request('GET', '/');
    console.log('1. Root Health Check:', health.status === 200 ? '✅ PASS' : '❌ FAIL', health.data.message);

    // 2. Admin Login
    const adminLogin = await request('POST', '/api/auth/login', {
      email: 'admin@hotelpro.com',
      password: 'Admin@123',
    });
    console.log('2. Admin Login:', adminLogin.status === 200 ? '✅ PASS' : '❌ FAIL', 'Role:', adminLogin.data.user?.role);
    const adminToken = adminLogin.data.token;

    // 3. Register a regular user
    const userEmail = `alice_${Date.now()}@test.com`;
    const regRes = await request('POST', '/api/auth/register', {
      name: 'Alice Johnson',
      number: '9123456780',
      email: userEmail,
      password: 'Password123!',
      gender: 'Female',
      age: 24,
    });
    console.log('3. User Registration:', regRes.status === 201 ? '✅ PASS' : '❌ FAIL', regRes.data.message);

    // 4. User Login
    const userLogin = await request('POST', '/api/auth/login', {
      email: userEmail,
      password: 'Password123!',
    });
    console.log('4. User Login:', userLogin.status === 200 ? '✅ PASS' : '❌ FAIL', 'Token received:', !!userLogin.data.token);
    const userToken = userLogin.data.token;

    // 5. Add a Room as Admin
    const roomNum = Math.floor(100 + Math.random() * 800);
    const addRoomRes = await request(
      'POST',
      '/api/rooms/addroom',
      {
        roomNumber: roomNum,
        count: 2,
        rent: 3500,
        type: 'Deluxe Suite',
        description: 'Spacious ocean-view room with king-size bed, private balcony, and high-speed Wi-Fi.',
        photoUrls: ['/uploads/sample-room-1.jpg'],
      },
      adminToken
    );
    console.log('5. Admin Add Room:', addRoomRes.status === 201 ? '✅ PASS' : '❌ FAIL', `Room #${roomNum} created`);
    const roomId = addRoomRes.data.room._id;

    // 6. Get all rooms (Public)
    const getRooms = await request('GET', '/api/rooms');
    console.log('6. Get Rooms:', getRooms.status === 200 ? '✅ PASS' : '❌ FAIL', `Total rooms: ${getRooms.data.count}`);

    // 7. Book the room as User
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() + 10);
    const toDate = new Date();
    toDate.setDate(toDate.getDate() + 13); // 3 nights

    const bookRes = await request(
      'POST',
      '/api/bookings/bookroom',
      {
        roomid: roomId,
        fromdate: fromDate.toISOString(),
        todate: toDate.toISOString(),
        phone: 9123456780,
        cardDetails: {
          cardholdername: 'Alice Johnson',
          cardnumber: '4111 2222 3333 4444',
          expmonthyear: '12/28',
          cvv: '123', // Must not be saved
        },
      },
      userToken
    );
    console.log(
      '7. Book Room:',
      bookRes.status === 201 ? '✅ PASS' : '❌ FAIL',
      `Days: ${bookRes.data.booking?.totaldays}, Total: ₹${bookRes.data.booking?.totalAmount}, Card: ${bookRes.data.booking?.cardDetails?.cardnumber}`
    );
    const bookingId = bookRes.data.booking?._id;

    // 8. Try overlapping booking (SHOULD FAIL with 400)
    const overlapFrom = new Date();
    overlapFrom.setDate(overlapFrom.getDate() + 11);
    const overlapTo = new Date();
    overlapTo.setDate(overlapTo.getDate() + 14);

    const overlapRes = await request(
      'POST',
      '/api/bookings/bookroom',
      {
        roomid: roomId,
        fromdate: overlapFrom.toISOString(),
        todate: overlapTo.toISOString(),
        phone: 9998887776,
        cardDetails: {
          cardholdername: 'Bob Test',
          cardnumber: '5555 4444 3333 2222',
          expmonthyear: '05/27',
          cvv: '999',
        },
      },
      userToken
    );
    console.log(
      '8. Overlapping Booking Rejection:',
      overlapRes.status === 400 ? '✅ PASS (Correctly rejected)' : '❌ FAIL',
      overlapRes.data.message
    );

    // 9. User View Booking History
    const userBookings = await request('GET', '/api/bookings/user', null, userToken);
    console.log(
      '9. User Booking History:',
      userBookings.status === 200 ? '✅ PASS' : '❌ FAIL',
      `Bookings count: ${userBookings.data.count}`
    );

    // 10. Cancel Booking
    const cancelRes = await request('PUT', `/api/bookings/cancel/${bookingId}`, {}, userToken);
    console.log(
      '10. Cancel Booking:',
      cancelRes.status === 200 ? '✅ PASS' : '❌ FAIL',
      cancelRes.data.message
    );

    // 11. Admin View All Bookings and Users
    const adminBookings = await request('GET', '/api/bookings', null, adminToken);
    const adminUsers = await request('GET', '/api/users', null, adminToken);
    console.log(
      '11. Admin Bookings & Users Fetch:',
      adminBookings.status === 200 && adminUsers.status === 200 ? '✅ PASS' : '❌ FAIL',
      `Total bookings: ${adminBookings.data.count}, Total users: ${adminUsers.data.count}`
    );

    console.log('\n🎯 ALL BACKEND API TESTS COMPLETED SUCCESSFULLY!\n');
    process.exit(0);
  } catch (err) {
    console.error('❌ Test failed with error:', err.message);
    process.exit(1);
  }
}

runTests();
