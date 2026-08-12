# StayEasy – Hotel / Room Booking System

Full-stack hotel room booking project using React + TypeScript + MUI + Redux Toolkit + Node/Express + MongoDB.

## Features

### Customer
- Register / Login with JWT authentication
- Search hotels by location and date range
- Real-time room availability based on booking conflicts
- Double-booking prevention
- Capacity validation
- Booking confirmation and automatic total calculation
- My Bookings page
- Booking cancellation
- Availability calendar with booked dates disabled

### Admin
- JWT protected admin dashboard
- KPI cards: properties, users, confirmed/cancelled bookings, revenue
- Booking search
- Pagination using Material UI Table + TablePagination
- Cancel bookings
- Add properties and rooms
- Delete properties

## Date-range conflict logic
A room is considered unavailable when:

`existing.checkIn < requested.checkOut && existing.checkOut > requested.checkIn`

This allows checkout on the same day another booking checks in, while blocking every overlapping range.

## Run backend

```bash
cd backend
npm install
copy .env.example .env
npm run seed
npm run dev
```

Linux/macOS:
```bash
cp .env.example .env
```

Default admin after seed:
- Email: `admin@stayeasy.com`
- Password: `Admin@123`

Change the password / JWT secret before real deployment.

## Run frontend

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`.

Backend API runs at `http://localhost:5000`.

## MongoDB

Default connection:
`mongodb://127.0.0.1:27017/hotel_booking`

For MongoDB Atlas, replace `MONGO_URI` in `.env` with the Atlas connection string.
