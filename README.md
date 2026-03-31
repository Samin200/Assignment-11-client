# BookCourier - Library-to-Home Delivery System

BookCourier is a full-stack library management and delivery platform where users can browse, order, and receive books from nearby libraries without visiting in person. Librarians manage books and orders, while admins oversee users, roles, and the entire system.

This project was built as part of Programming Hero Assignment-11.

## Live Demo

- **Frontend**: [https://assignment-11-client-yhwt.vercel.app/](https://assignment-11-client-yhwt.vercel.app/)  
- **Backend API**: [https://vercel.com/samin200s-projects/assignment-11-client-yhwt/deployments](https://vercel.com/samin200s-projects/assignment-11-client-yhwt/deployments) (or wherever you deployed)

## Key Features

### Authentication & Roles
- Email/password + social login (Google)
- Role-based access: User, Librarian, Admin
- Become a Librarian request system (with reason & approval flow)

### User Features
- Browse all books
- View book details & place orders
- My Orders (track status, cancel unpaid, pay via Stripe)
- My Profile (update name/photo)
- Invoices (payment history)

### Librarian Features
- Add new books (with ImgBB image upload)
- View & manage own books (publish/unpublish)
- View & update order status (pending → shipped → delivered)

### Admin Features
- Manage all users (change roles: make librarian/admin)
- Approve/reject librarian requests
- View & delete any book (also deletes related orders)
- Full dashboard with tables and real-time updates

### Payments & Orders
- Stripe checkout integration
- Webhook updates order status to "paid/completed"
- Order cancellation (if unpaid)

### Other
- Secure Firebase token verification on private routes
- Permanent image upload via ImgBB
- Responsive Tailwind CSS design (glassmorphism style)

## Tech Stack

**Frontend**
- React + Vite
- React Router v6
- Tailwind CSS + DaisyUI
- Firebase Authentication
- Axios (with token interceptor)
- SweetAlert2

**Backend**
- Node.js + Express
- MongoDB (Mongoose not used – native driver)
- Firebase Admin SDK (token verification)
- Stripe (payments + webhook)
- ImgBB API (image hosting)
- dotenv, cors, nodemon

**Deployment (recommended)**
- Frontend → Vercel / Netlify
- Backend → Render / Vercel / Railway

## Installation & Setup

### Prerequisites
- Node.js ≥ 18
- MongoDB Atlas account (or local MongoDB)
- Firebase project
- Stripe test keys
- ImgBB API key

### Environment Variables

**Frontend (.env.local or .env)**

```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-auth-domain
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-storage-bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id