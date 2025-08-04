# CarsWorld 🚗 | Premium Car Rental Platform

CarsWorld is a modern, full-stack car rental platform built with the MERN stack. It provides a seamless experience for users to browse, book, and manage car rentals with real-time features, secure payments, and an intuitive admin dashboard.

This project goes beyond traditional car rental websites by integrating real-time communication, 3D car visualization, advanced analytics, and a comprehensive admin panel, creating a complete digital ecosystem for modern car rental services.

**Live Demo:** [Frontend - Vercel](https://cars-world-dun.vercel.app) | [Backend - Render](https://carsworld-backend.onrender.com)

## 🚀 Core Features

### 🛍️ Car Rental & Booking System
- **Browse & Search**: Advanced filtering by brand, fuel type, transmission, price range, and location
- **Car Details**: Comprehensive car information with multiple images, specifications, and real-time availability
- **Secure Booking**: Complete booking flow with date selection, price calculation, and secure payment processing
- **Order Management**: Full booking tracking for both users and administrators

### 🎨 Interactive User Experience
- **3D Car Visualization**: Interactive 3D car models using Three.js and React Three Fiber
- **Real-Time Updates**: Live booking status updates and car availability using Socket.IO
- **Responsive Design**: Modern, mobile-first design with smooth animations and transitions
- **Wishlist System**: Save favorite cars for future reference

### 💬 Community & Communication
- **Real-Time Chat**: Socket.IO powered live chat for customer support
- **Reviews & Ratings**: Two-way review system to build trust and transparency
- **User Profiles**: Personalized user dashboards with booking history and preferences

### 📊 Analytics & Management
- **Admin Dashboard**: Comprehensive analytics with charts, user management, and booking oversight
- **Real-Time Analytics**: Live statistics on bookings, revenue, and user activity
- **Car Management**: Add, edit, and manage car inventory with bulk operations
- **User Management**: Admin controls for user accounts, roles, and permissions

### 💳 Payment & Security
- **Razorpay Integration**: Secure payment processing with multiple payment methods
- **Booking Verification**: Complete payment verification and booking confirmation
- **Transaction History**: Detailed payment and booking records

## 🛠️ Tech Stack & Architecture

This application is built using a modern, scalable architecture with the following technologies:

### Frontend
- **React 19** with Vite for fast development
- **TailwindCSS** for modern, responsive styling
- **Framer Motion** for smooth animations
- **React Router** for client-side routing
- **Socket.IO Client** for real-time features
- **Three.js & React Three Fiber** for 3D visualization
- **Chart.js** for analytics and data visualization
- **Axios** for API communication

### Backend
- **Node.js** with Express.js framework
- **MongoDB** with Mongoose ODM
- **Socket.IO** for real-time communication
- **JWT** for authentication and authorization
- **bcryptjs** for password hashing
- **Multer** for file uploads
- **Razorpay** for payment processing
- **ImageKit** for image hosting and optimization

### System Architecture

```
+------------------+      +-------------------+      +---------------------+
|                  |      |                   |      |                     |
|   React Client   |----->|   Node.js/Express |----->|      MongoDB        |
| (Vercel)         |      |   API Server      |      |     (Database)      |
|                  |      | (Render)          |      |                     |
+--------^---------+      +-------------------+      +---------------------+
         |
         | Real-time
         | (WebSockets)
         |
+--------|---------+
|                  |
|  Socket.IO Server|
| (Render)         |
|                  |
+------------------+
```

## 🚀 Getting Started

Follow these instructions to get a local copy of the project up and running for development and testing purposes.

### Prerequisites
- Node.js (v18 or higher) & npm
- MongoDB (local instance or MongoDB Atlas account)
- Razorpay account for payment processing
- ImageKit account for image hosting

### Installation & Setup

1. **Clone the repository:**
```bash
git clone https://github.com/darshanbhere7/CarsWorld.git
cd CarsWorld
```

2. **Setup the Backend:**
```bash
cd backend
npm install
```

Create a `.env` file in the `/backend` directory and add the following variables:
```env
DB_URI=<Your_MongoDB_Connection_String>
PORT=5000

JWT_SECRET=<Create_A_Strong_JWT_Secret>
JWT_EXPIRE=5d

RAZORPAY_KEY_ID=<Your_Razorpay_Key_ID>
RAZORPAY_KEY_SECRET=<Your_Razorpay_Key_Secret>

IMAGEKIT_PUBLIC_KEY=<Your_ImageKit_Public_Key>
IMAGEKIT_PRIVATE_KEY=<Your_ImageKit_Private_Key>
IMAGEKIT_URL_ENDPOINT=<Your_ImageKit_URL_Endpoint>
```

3. **Setup the Frontend:**
```bash
cd ../frontend
npm install
```

Create a `.env` file in the `/frontend` directory:
```env
VITE_API_URL=http://localhost:5000
```

**Note:** For production, the frontend automatically uses the Render backend URL.

### Running the Application

1. **Start the Backend Server:**
```bash
# from the /backend directory
npm run dev
```

2. **Start the Frontend Client:**
```bash
# from the /frontend directory
npm run dev
```

Your application should now be live!
- Frontend running on http://localhost:5173 (Vite dev server)
- Backend API on http://localhost:5000
- Socket.IO server integrated with the backend

**Production URLs:**
- Frontend: https://cars-world-dun.vercel.app
- Backend: https://carsworld-backend.onrender.com

## 📱 Key Features in Detail

### 🎯 User Experience
- **Responsive Design**: Mobile-first approach with TailwindCSS
- **3D Car Models**: Interactive 3D car visualization using Three.js
- **Real-Time Updates**: Live booking status and availability updates
- **Smooth Animations**: GSAP and Framer Motion for engaging interactions

### 🔐 Authentication & Security
- **JWT Authentication**: Secure token-based authentication
- **Role-Based Access**: Admin and user role management
- **Password Hashing**: bcryptjs for secure password storage
- **CORS Protection**: Configured for production deployment

### 💳 Payment Integration
- **Razorpay Gateway**: Secure payment processing
- **Payment Verification**: Complete payment verification system
- **Transaction Records**: Detailed payment and booking history

### 📊 Admin Features
- **Analytics Dashboard**: Charts and statistics for business insights
- **User Management**: Admin controls for user accounts
- **Car Inventory**: Complete car management system
- **Booking Oversight**: Real-time booking monitoring

### 🖼️ Media Management
- **ImageKit Integration**: Optimized image hosting and delivery
- **Multiple Images**: Support for car image galleries
- **Image Optimization**: Automatic image compression and optimization

## 🚀 Deployment

### Backend Deployment (Render)
The backend is deployed on Render with the following configuration:
- **Platform**: Render
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Environment**: Node.js
- **Auto-deploy**: Enabled for GitHub integration

### Frontend Deployment (Vercel)
The frontend is deployed on Vercel with the following configuration:
- **Platform**: Vercel
- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Auto-deploy**: Enabled for GitHub integration

### Environment Variables

**Backend (Render):**
```env
DB_URI=<Your_MongoDB_Connection_String>
PORT=5000
JWT_SECRET=<Your_JWT_Secret>
JWT_EXPIRE=5d
RAZORPAY_KEY_ID=<Your_Razorpay_Key_ID>
RAZORPAY_KEY_SECRET=<Your_Razorpay_Key_Secret>
IMAGEKIT_PUBLIC_KEY=<Your_ImageKit_Public_Key>
IMAGEKIT_PRIVATE_KEY=<Your_ImageKit_Private_Key>
IMAGEKIT_URL_ENDPOINT=<Your_ImageKit_URL_Endpoint>
```

**Frontend (Vercel):**
```env
VITE_API_URL=https://carsworld-backend.onrender.com
```

## 🤝 Contributing

Contributions make the open-source community an amazing place to learn, inspire, and create. Any contributions you make are greatly appreciated.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is distributed under the MIT License. See LICENSE for more information.


Project Link: https://github.com/darshanbhere7/CarsWorld

**Deployment Status:**
- ✅ Frontend: [Live on Vercel](https://cars-world-dun.vercel.app)
- ✅ Backend: [Live on Render](https://carsworld-backend.onrender.com)
- ✅ Database: MongoDB Atlas
- ✅ Real-time: Socket.IO integrated

---

**Built with ❤️ using the MERN stack** 
