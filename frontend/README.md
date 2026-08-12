# StayEasy Hotel / Room Booking System v3

Full-stack React + TypeScript + MUI + Redux Toolkit + Node/Express + MongoDB project.

## v3 features
- User registration/login with JWT
- User profile + avatar URL
- Hotel and room image URLs
- Location/date availability search
- MUI date pickers
- Room capacity validation
- Date-range conflict / double-booking prevention
- Booking cancellation
- Demo payment flow (no real charge)
- PDF booking invoice
- Optional SMTP booking confirmation email
- Admin dashboard with stats, search and pagination
- Admin property add/edit/delete
- Property/room image support
- Responsive Material UI

## Setup

### Backend
```bash
cd backend
npm install
copy .env.example .env
npm run seed
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```
Open http://localhost:5173

### Demo accounts
Admin: admin@stayeasy.com / Admin@123
Guest: guest@stayeasy.com / Guest@123

### MongoDB
Use local MongoDB or put your MongoDB Atlas URI in backend/.env.

### Email
SMTP is optional. If SMTP variables are blank, confirmation email content is printed to the backend console instead of being sent.

### Payment
The included payment screen is intentionally a demo payment flow. Connect Stripe/Razorpay/another gateway before using it for real payments.
