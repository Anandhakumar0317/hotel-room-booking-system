Run this from:

`~/hotel-room-booking-system`

````bash
cd ~/hotel-room-booking-system

cp README.md README.md.backup

cat > README.md <<'EOF'
# StayEasy – Hotel / Room Booking System

StayEasy is a full-stack hotel and room booking system built with React, TypeScript, Material UI, Redux Toolkit, Node.js, Express.js and MongoDB.

The system supports customer hotel/room booking, availability checking, booking cancellation, online/offline payment tracking, refund management and a protected admin dashboard with booking reports.

## Technology Stack

### Frontend
- React
- TypeScript
- Vite
- Material UI (MUI)
- Redux Toolkit
- MUI Date Pickers

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- PDFKit
- ExcelJS
- Nodemailer

## Features

### Customer Features

- User registration and login
- JWT-based authentication
- Search hotels by location
- Search rooms using check-in and check-out dates
- Real-time room availability
- Date-range booking conflict validation
- Double-booking prevention
- Room capacity validation
- Automatic booking total calculation
- Booking confirmation
- Unique StayEasy Booking ID
- My Bookings page
- Booking cancellation
- Cancellation policy handling
- Refund percentage and refund amount tracking
- Refund status tracking
- Online payment method
- Offline payment method
- Payment status tracking
- Transaction ID support
- Booking invoice / booking details
- Availability calendar
- Booked dates disabled in calendar

## Booking Conflict Logic

A room is considered unavailable when an existing booking overlaps the requested date range:

`existing.checkIn < requested.checkOut && existing.checkOut > requested.checkIn`

This allows a guest to check out on the same day another guest checks in, while preventing overlapping bookings for the same room.

## Payment and Refund Management

Bookings support:

- Online payment
- Offline payment
- Pending payment
- Paid payment
- Refunded payment

Cancellation and refund information includes:

- Refund percentage
- Refund amount
- Refund status
- Pending refund
- Processed refund

Cancelled bookings are excluded from the Admin Paid Revenue calculation.

## Admin Dashboard

The admin dashboard is protected using JWT authentication and admin authorization.

### Dashboard KPIs

- Total properties
- Total users
- Confirmed bookings
- Cancelled bookings
- Paid revenue

Paid revenue is calculated only from bookings where:

- Payment status is `paid`
- Booking status is not `cancelled`

## Admin Booking Management

- View bookings
- Search bookings
- Pagination
- Guest details
- Hotel and room details
- Booking dates
- Booking status
- Payment status
- Payment method
- Refund status
- Refund amount
- Total booking amount
- Cancel bookings
- Refund processing support

## Admin Report System

The admin dashboard includes a booking report system with filters.

### Report Filters

- From date
- To date
- Booking status
- Payment status
- Payment method
- Refund status
- Hotel
- Location
- Report search

### Report Search

The report search can be used to search by:

- Booking ID
- Guest name
- Guest email
- Hotel name
- Room ID
- Location

The report must be searched before downloading.

If no matching bookings are found:

- PDF download remains disabled
- Excel download remains disabled

If matching bookings are found:

- PDF download is enabled
- Excel download is enabled

### Report Export

Admin can export filtered booking reports as:

- PDF
- Excel (.xlsx)

PDF reports include:

- StayEasy branding
- Report generation date
- Selected report period
- Summary
- Total bookings
- Confirmed bookings
- Cancelled bookings
- Paid revenue
- Pending refunds
- Completed refunds
- Booking details

Excel reports include:

- Summary sheet
- Bookings sheet
- Booking ID
- Guest
- Email
- Hotel
- Location
- Room
- Check-in
- Check-out
- Guests
- Booking status
- Payment status
- Payment method
- Refund status
- Refund percentage
- Refund amount
- Total amount

## Property and Room Management

Admin can:

- Add properties
- Add rooms
- Manage hotel details
- Manage room details
- Delete properties
- Configure room capacity
- Configure room pricing

## Authentication

The application uses JWT-based authentication.

Protected areas include:

- Customer booking actions
- My Bookings
- Admin Dashboard
- Admin reports
- Property management
- Booking management

## Database

MongoDB is used as the application database.

Default local MongoDB connection:

`mongodb://127.0.0.1:27017/hotel_booking`

For MongoDB Atlas, configure the `MONGO_URI` value in the backend `.env` file.

## Backend Setup

```bash
cd backend
npm install
````

Create the environment file:

Linux/macOS:

```bash
cp .env.example .env
```

Configure MongoDB and other environment variables in `.env`.

Seed the database:

```bash
npm run seed
```

Start development server:

```bash
npm run dev
```

Production start:

```bash
npm start
```

Backend API:

`http://localhost:5001`

## Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend development URL:

`http://localhost:5173`

## Frontend Production Build

Check TypeScript:

```bash
npx tsc --noEmit
```

Build production files:

```bash
npm run build
```

The production build is generated in:

`frontend/dist`

## Production Deployment

The backend can be managed using PM2.

Example:

```bash
pm2 restart hotel-backend
```

Check backend status:

```bash
pm2 status
```

View backend logs:

```bash
pm2 logs hotel-backend
```

## Default Admin Account

After database seeding:

* Email: `admin@stayeasy.com`
* Password: `Admin@123`

Change the default password and JWT secret before real deployment.

## Project Structure

```text
hotel-room-booking-system/
│
├── backend/
│   ├── src/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── middleware.js
│   │   ├── server.js
│   │   └── scripts/
│   ├── package.json
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── api.ts
│   │   ├── pages/
│   │   ├── components/
│   │   ├── store/
│   │   └── main.tsx
│   ├── package.json
│   └── vite.config.ts
│
└── README.md
```

## Important Security Notes

Do not commit the following to GitHub:

* `.env`
* MongoDB passwords
* JWT secrets
* API keys
* Payment credentials
* Production credentials

Use `.env.example` for documenting required environment variables.

## Project Status

The StayEasy hotel and room booking system currently includes:

* Customer authentication
* Hotel and room search
* Availability checking
* Double-booking prevention
* Booking management
* Online/offline payment tracking
* Cancellation and refund management
* Admin dashboard
* Booking search and pagination
* Advanced report filtering
* PDF report export
* Excel report export
* Production frontend build
* PM2 backend deployment support
  EOF

echo "README.md updated successfully."

git status --short

git add README.md
git commit -m "docs: update StayEasy README"

git push origin main

````

After the command finishes, verify:

```bash
git status
git log -1 --oneline
````

You should see the new commit and `working tree clean`.
