# CarsWorld - Car Rental Platform

CarsWorld is a full-stack car rental web application where users can browse, book, and review cars, manage bookings, and more. It features user authentication, admin management, payment integration, and a modern responsive UI.

## Features
- User registration & login
- Browse and search cars
- Car detail pages with booking and reviews
- Wishlist (save favorite cars)
- Booking and payment flow
- User profile management
- Admin dashboard (manage cars, users, bookings, reviews)
- Contact/Enquiry form
- Dark/light theme support
- Responsive design
- Toast notifications
- Image upload for cars

## Tech Stack
- **Frontend:** React, Vite, Tailwind CSS, React Router, React Toastify
- **Backend:** Node.js, Express, MongoDB, Mongoose
- **Other:** ImageKit, JWT Auth, REST API

## Getting Started

### Prerequisites
- Node.js (v16+ recommended)
- npm or yarn
- MongoDB instance (local or cloud)

### Setup
1. **Clone the repository:**
   ```bash
   git clone <repo-url>
   cd carsWorld
   ```
2. **Install dependencies:**
   ```bash
   cd backend && npm install
   cd ../frontend && npm install
   ```
3. **Configure environment variables:**
   - Copy `.env.example` to `.env` in `backend/` and fill in your MongoDB URI, JWT secret, and ImageKit credentials.
4. **Start the backend server:**
   ```bash
   cd backend
   npm run dev
   ```
5. **Start the frontend dev server:**
   ```bash
   cd frontend
   npm run dev
   ```
6. **Visit** `http://localhost:5173` in your browser.

## Usage
- Register as a new user or login.
- Browse available cars, view details, and book cars for your dates.
- Manage your bookings and profile from the dashboard.
- Admins can add/edit/delete cars, manage users, bookings, and reviews.
- Contact the team via the Contact Us page.

## Deployment
- Build frontend: `npm run build` in `frontend/`
- Deploy backend and frontend to your preferred platform (e.g., Vercel, Netlify, Heroku, Render, etc.)
- Set environment variables in production.

## Contributing
Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

## License
[MIT](LICENSE)
