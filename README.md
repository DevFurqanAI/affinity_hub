# Affinity Hub

Affinity Hub is a full-stack MERN social media web application designed for modern online communities. It allows users to register securely, create profiles, share posts and stories, follow other users, interact through likes and comments, receive notifications, manage account settings, and use admin moderation tools.

The project includes authentication, onboarding, media uploads, email verification, password recovery, user moderation, reports, bans, appeals, responsive UI, dark/light appearance support, and cloud deployment.

---

## Live Demo

Frontend: https://affinity-hub-liart.vercel.app
Backend Health Check: https://affinity-hub-api.onrender.com/api/health

---

## Project Overview

Affinity Hub is built as a complete social platform with a separated frontend and backend architecture. The frontend is developed with React and Vite, while the backend is powered by Node.js, Express.js, MongoDB, and Mongoose. The application supports secure authentication using JWT access/refresh tokens, HTTP-only cookies, Google OAuth, Cloudflare Turnstile protection, Brevo transactional emails, and Cloudinary media storage.

The platform is designed with a dark-mode-first modern interface, responsive layouts, mobile bottom navigation, desktop sidebar navigation, story viewer, profile management, notification system, admin dashboards, and moderation workflows.

---

## Key Features

### Authentication and Security

* Email/password registration and login
* Google OAuth login/signup
* Email OTP verification
* Forgot password and reset password using OTP
* JWT access and refresh token authentication
* HTTP-only refresh token cookies
* Protected routes for authenticated users
* Public-only routes for login/register pages
* Banned user route handling
* Cloudflare Turnstile CAPTCHA for registration
* Account security settings
* Linked Google account management
* Change password functionality

### User Onboarding

* Email verification after local signup
* Profile setup after registration
* Interest selection before entering the main app
* Separate onboarding flow for Google users
* Profile completion flags for better route guarding

### Profile System

* View own profile and other user profiles
* Edit display name, username, and bio
* Upload profile avatar
* Remove profile avatar
* Follow and unfollow users
* Followers and following counts
* User suggestions sidebar
* Blocked accounts support

### Posts

* Create text, image, and video posts
* Public, followers-only, and private visibility
* Edit and delete own posts
* View home feed
* Explore public posts
* Like and unlike posts
* View users who liked a post
* Comment on posts
* Edit and delete own comments
* Post count, like count, and comment count updates

### Stories

* Create image/video stories
* Stories expire after 24 hours
* Story viewer with progress indicators
* Viewed/unviewed story state
* Story views list for story owner
* Delete own stories
* Story privacy based on follow/block relationships

### Search

* Search users by name or username
* Search posts by caption
* Separate search results for users and posts
* Responsive search page design

### Notifications

* Follow notifications
* Like notifications
* Comment notifications
* Report/ban/appeal-related notifications
* Mark single notification as read
* Mark all notifications as read
* Delete notifications
* Notification drawer and notification page

### Reports and Moderation

* Report users, posts, comments, and stories
* Admin report review
* Admin report status update
* Admin action handling for reported content
* User banning system
* Temporary or permanent bans
* Ban removal
* User ban appeals
* Admin appeal review

### Admin Panel

* Admin dashboard
* Admin statistics
* Admin users list
* Admin reports page
* Admin bans page
* Admin appeals page
* Protected admin-only routes

### UI/UX

* Dark-mode-first design
* Light and dark appearance toggle
* Responsive desktop and mobile layouts
* Desktop sidebar navigation
* Mobile bottom navigation
* Header menu for settings and account actions
* Custom scrollbar for desktop
* Hidden scrollbar behavior on mobile
* Story viewer with blurred background
* Polished empty states and loading states

---

## Tech Stack

### Frontend

* React
* Vite
* React Router
* Zustand
* Axios
* Tailwind CSS
* Lucide React Icons
* React Hot Toast
* Google OAuth Provider
* React Turnstile

### Backend

* Node.js
* Express.js
* MongoDB
* Mongoose
* Zod validation
* JWT authentication
* Bcrypt password hashing
* Cookie Parser
* Helmet
* Morgan
* Multer
* Cloudinary
* Brevo Transactional Email API
* Google Auth Library

### Database

* MongoDB Atlas
* Mongoose models and relationships

### Cloud Services

* Vercel for frontend deployment
* Render for backend deployment
* MongoDB Atlas for cloud database
* Cloudinary for media storage
* Brevo for transactional emails
* Google Cloud Console for OAuth
* Cloudflare Turnstile for CAPTCHA protection

---

## Folder Structure

```bash
affinity-hub/
│
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── pages/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── store/
│   │   ├── utils/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   │
│   ├── public/
│   ├── package.json
│   └── vite.config.js
│
├── server/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middlewares/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── seed/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── validations/
│   │   ├── app.js
│   │   └── server.js
│   │
│   ├── package.json
│   └── .env.example
│
├── README.md
└── .gitignore
```

---

## Main Backend Modules

* Auth module
* User/profile module
* Follow module
* Post module
* Like module
* Comment module
* Story module
* Notification module
* Search module
* Report module
* Ban and appeal module
* Admin module
* Block module
* Interest module

---

## Environment Variables

Environment variables are required for both frontend and backend. Never commit real `.env` files to GitHub.

### Client Environment Variables

Create:

```bash
client/.env
```

Example:

```env
VITE_APP_NAME=Affinity Hub
VITE_API_BASE_URL=http://localhost:5000/api
VITE_TURNSTILE_SITE_KEY=your_cloudflare_turnstile_site_key
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

For production, `VITE_API_BASE_URL` should point to the deployed backend API.

Example:

```env
VITE_API_BASE_URL=https://affinity-hub-api.onrender.com/api
```

### Server Environment Variables

Create:

```bash
server/.env
```

Example:

```env
NODE_ENV=development
PORT=5000

MONGO_URI=your_mongodb_atlas_connection_string

CLIENT_URL=http://localhost:5173

JWT_ACCESS_SECRET=your_access_token_secret
JWT_REFRESH_SECRET=your_refresh_token_secret
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
COOKIE_EXPIRES_DAYS=7

CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
CLOUDINARY_FOLDER=affinity-hub

BREVO_API_KEY=your_brevo_api_key
BREVO_SENDER_EMAIL=your_verified_sender_email
BREVO_SENDER_NAME=Affinity Hub

TURNSTILE_SECRET_KEY=your_cloudflare_turnstile_secret_key

OTP_EXPIRES_MINUTES=10
OTP_RESEND_COOLDOWN_SECONDS=60
OTP_MAX_ATTEMPTS=5

GOOGLE_CLIENT_ID=your_google_client_id
```

For production, `CLIENT_URL` should point to the deployed frontend.

Example:

```env
CLIENT_URL=https://affinity-hub-liart.vercel.app
```

---

## Installation and Setup

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd affinity-hub
```

### 2. Install Frontend Dependencies

```bash
cd client
npm install
```

### 3. Install Backend Dependencies

```bash
cd ../server
npm install
```

### 4. Setup Environment Variables

Create `.env` files inside both `client` and `server` folders using the examples above.

### 5. Run Backend

```bash
cd server
npm run dev
```

Backend will run on:

```bash
http://localhost:5000
```

Health check:

```bash
http://localhost:5000/api/health
```

### 6. Run Frontend

Open a new terminal:

```bash
cd client
npm run dev
```

Frontend will run on:

```bash
http://localhost:5173
```

---

## Available Scripts

### Client

```bash
npm run dev
```

Runs the frontend development server.

```bash
npm run build
```

Builds the frontend for production.

```bash
npm run preview
```

Previews the production build locally.

```bash
npm run lint
```

Runs linting.

### Server

```bash
npm run dev
```

Runs the backend using Nodemon.

```bash
npm start
```

Runs the backend in normal Node.js mode.

```bash
npm run seed
```

Runs database seed scripts if configured.

---

## Deployment

### Frontend Deployment

The frontend is deployed on Vercel.

Production frontend:

```bash
https://affinity-hub-liart.vercel.app
```

Important Vercel settings:

* Root directory: `client`
* Build command: `npm run build`
* Output directory: `dist`
* Required environment variables:

  * `VITE_API_BASE_URL`
  * `VITE_GOOGLE_CLIENT_ID`
  * `VITE_TURNSTILE_SITE_KEY`

### Backend Deployment

The backend is deployed on Render.

Production backend health check:

```bash
https://affinity-hub-api.onrender.com/api/health
```

Important Render settings:

* Root directory: `server`
* Build command: `npm install`
* Start command: `npm start`
* Required environment variables:

  * `NODE_ENV`
  * `MONGO_URI`
  * `CLIENT_URL`
  * `JWT_ACCESS_SECRET`
  * `JWT_REFRESH_SECRET`
  * `CLOUDINARY_*`
  * `BREVO_*`
  * `TURNSTILE_SECRET_KEY`
  * `GOOGLE_CLIENT_ID`

---

## API Health Check

The backend provides a health route to confirm the API is running.

```http
GET /api/health
```

Example response:

```json
{
  "statusCode": 200,
  "data": {
    "service": "Affinity Hub API",
    "status": "running"
  },
  "message": "Health check successful",
  "success": true
}
```

---

## Security Notes

* Passwords are hashed using bcrypt.
* Refresh tokens are stored in HTTP-only cookies.
* Access tokens are short-lived.
* Protected routes require authentication.
* Admin routes require admin authorization.
* Registration is protected using Turnstile CAPTCHA.
* Email verification and password reset use OTPs.
* Environment files are ignored using `.gitignore`.
* Media uploads are stored on Cloudinary.
* Transactional emails are sent using Brevo.

---

## Testing Checklist

Before final submission or demo, test:

* User registration
* Email OTP verification
* Login and logout
* Google authentication
* Forgot password and reset password
* Profile setup
* Interest selection
* Profile editing
* Avatar upload and removal
* Create, edit, and delete posts
* Like and unlike posts
* View liked users
* Add, edit, and delete comments
* Create, view, and delete stories
* Follow and unfollow users
* Search users and posts
* Notifications
* Reports
* Bans and appeals
* Admin dashboard
* Mobile responsiveness
* Dark/light appearance
* Deployment links

---

## Future Improvements

* Real-time notifications using Socket.IO
* Direct messaging
* Saved posts
* Hashtags and mentions
* Infinite scrolling
* Image optimization and compression
* Advanced admin analytics
* User activity logs
* Better recommendation algorithm
* PWA support
* Unit and integration testing

---

## Project Status

Affinity Hub is currently deployed and functional as a complete MERN social media platform with authentication, onboarding, posting, stories, notifications, search, moderation, admin tools, and responsive UI.

---

## Author

Developed by Muhammad Furqan Arshad.

Project: Affinity Hub
Category: Full Stack MERN Social Media Application
