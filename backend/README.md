# Backend

Node.js + Express + MongoDB/Mongoose API.

Important endpoints:
- POST /api/auth/register
- POST /api/auth/login
- GET /api/properties?location=&checkIn=&checkOut=
- POST /api/bookings (JWT)
- GET /api/bookings/mine (JWT)
- PATCH /api/bookings/:id/cancel (JWT)
- GET /api/bookings/calendar/:propertyId
- GET /api/admin/stats (admin JWT)
- GET /api/bookings?page=1&limit=8&search=... (admin JWT)
- POST /api/properties (admin JWT)
- PUT /api/properties/:id (admin JWT)
- DELETE /api/properties/:id (admin JWT)
