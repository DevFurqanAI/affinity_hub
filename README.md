# Affinity Hub

### A Full-Stack Social Media and Community Interaction Platform

---

## Live Demo

**Frontend URL:**
https://affinity-hub-liart.vercel.app

**Backend Health Check:**
https://affinity-hub-api.onrender.com/api/health

### Admin Credentials

**Email:** [admin@affinityhub.demo](mailto:admin@affinityhub.demo)
**Password:** Admin@123456

### Normal Demo User

**Email:** [furqan@affinityhub.demo](mailto:furqan@affinityhub.demo)
**Password:** Demo@123456

---

## Project Overview

Affinity Hub is a full-stack MERN social media web application designed for modern online communities. It allows users to create accounts, verify email through OTP, complete profile setup, choose interests, create posts, upload media, follow other users, like and comment on posts, share stories, receive notifications, and manage account settings.

The project solves the problem of building a secure and interactive online community platform where users can discover content based on interests while admins can moderate reports, bans, appeals, and user activity from a protected admin panel.

Affinity Hub is built with a separated frontend and backend architecture. The frontend is deployed on Vercel, the backend API is deployed on Render, media files are stored on Cloudinary, transactional emails are sent through Brevo, and MongoDB Atlas is used as the cloud database.

---

## Tech Stack

### Frontend

* React.js with Vite
* Tailwind CSS
* React Router
* Zustand for state management
* Axios for API communication
* React Hot Toast for feedback messages
* Lucide React icons
* Google OAuth provider
* Cloudflare Turnstile CAPTCHA

### Backend

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT authentication
* Bcrypt password hashing
* Zod validation
* Multer for file handling
* Cloudinary for media uploads
* Brevo API for transactional emails
* Helmet and Morgan for security/logging

### Database

* MongoDB Atlas
* Mongoose schemas and relationships
* ObjectId references and population

### Deployment and Services

* Frontend: Vercel
* Backend API: Render
* Database: MongoDB Atlas
* Media Storage: Cloudinary
* Email Service: Brevo
* OAuth: Google Cloud Console
* CAPTCHA: Cloudflare Turnstile

---

## Core Features and Logic

### 1. Authentication and Onboarding

* Email/password registration and login
* Google OAuth login/signup
* Email OTP verification
* Forgot password and reset password using OTP
* Profile setup after signup
* Interest selection before entering the main app
* JWT access token and refresh token authentication
* HTTP-only cookie-based refresh token handling

### 2. Post Management

* Create, read, update, and delete posts
* Support for text, image, and video posts
* Public, followers-only, and private post visibility
* Like and unlike posts
* View users who liked a post
* Add, edit, and delete comments
* Live post count, like count, and comment count updates

### 3. Interest-Based Discovery Logic

Affinity Hub uses an interest-based discovery system. Users select interests during onboarding, and posts are automatically tagged on the backend using lightweight keyword-based classification.

For example:

* Posts about React, Node, APIs, or coding are tagged as Technology.
* Posts about exams, notes, and lectures are tagged as Education.
* Posts about gym, workouts, and health are tagged as Fitness.

The Explore page prioritizes posts that match the logged-in user’s selected interests while still showing general public posts as fallback content.

### 4. Stories

* Create image/video stories
* Stories expire after 24 hours
* Viewed/unviewed story state
* Story viewer with blurred background
* Story views available for story owner
* Delete own stories
* Story visibility respects follow/block relationships

### 5. User Interaction

* Follow and unfollow users
* Followers and following counts
* User suggestions
* Search users by name or username
* Search posts by caption
* Profile editing
* Avatar upload and removal
* Blocked user support

### 6. Notifications

* Follow notifications
* Like notifications
* Comment notifications
* Report, ban, and appeal notifications
* Mark notification as read
* Mark all notifications as read
* Delete notifications

### 7. Admin and Moderation

* Admin dashboard
* View platform statistics
* View and manage users
* Review user/post/comment/story reports
* Take moderation actions
* Ban users
* Remove bans
* Review ban appeals
* Protected admin-only routes

---

## Localized Optimizations

Affinity Hub is designed with local university and Pakistani student project requirements in mind.

* **Mobile-First Design:** The application is fully responsive and works properly on mobile browsers.
* **Low-Cost Deployment:** The project uses free or student-friendly cloud platforms such as Vercel, Render, MongoDB Atlas, Cloudinary, and Brevo.
* **Email OTP Workflow:** Email OTP verification supports secure account creation and password recovery.
* **Accessible Demo Data:** Seed data creates demo users, posts, likes, comments, reports, bans, and admin records for easy project evaluation.
* **Local Context Ready:** Future improvements include selectable timezone preferences such as PKT and more localized profile/location-based discovery.

Currency formatting is not included because Affinity Hub is a social media/community platform and does not handle payments or pricing.

---

## Security Measures

* **Password Hashing:** User passwords are securely hashed using Bcrypt.
* **JWT Authentication:** Access and refresh tokens are used for secure sessions.
* **HTTP-only Cookies:** Refresh tokens are stored in HTTP-only cookies.
* **Protected Routes:** Private routes require authentication.
* **Admin Middleware:** Admin pages are protected using role-based authorization.
* **OTP Verification:** Email verification and password reset use OTP flows.
* **CAPTCHA Protection:** Registration is protected using Cloudflare Turnstile.
* **Input Validation:** Server-side validation is handled using Zod.
* **Unique Constraints:** Email, username, likes, reports, follows, and interest relationships use unique constraints where needed.
* **Account Moderation:** Banned users are redirected and restricted from normal app access.
* **Environment Variables:** Sensitive keys are stored in `.env` files and excluded from GitHub.

---

## Database Schema

Affinity Hub uses MongoDB Atlas with Mongoose models and ObjectId references.

### Main Collections

* **User:** Stores user account details, authentication data, profile information, role, status, followers, and following.
* **Post:** Stores post author, caption, media, visibility, like count, comment count, and deletion status.
* **Comment:** Stores comments linked to posts and users.
* **Like:** Stores post likes with a unique post-user relationship.
* **Story:** Stores temporary image/video stories with expiry time.
* **StoryView:** Tracks which users viewed which stories.
* **Notification:** Stores user notifications for follows, likes, comments, reports, bans, and appeals.
* **Interest:** Stores available interest categories.
* **UserInterest:** Links users with selected interests.
* **PostInterest:** Links posts with detected interest categories.
* **NewInterestCounter:** Stores user and post counts for each interest.
* **Report:** Stores reports made against users, posts, comments, or stories.
* **Ban:** Stores ban records and moderation actions.
* **Appeal:** Stores user appeals against bans.
* **Block:** Stores blocked-user relationships.

### Relationship Examples

* One user can create many posts.
* One post can have many comments and likes.
* One user can follow many users.
* One post can belong to multiple interests.
* One user can select multiple interests.
* One report can target a user, post, comment, or story.
* One ban can have a related appeal.

---

## Installation and Setup

### 1. Clone the Repository

```bash
git clone <your-repo-link>
cd affinity-hub
```

### 2. Install Backend Dependencies

```bash
cd server
npm install
```

### 3. Install Frontend Dependencies

```bash
cd ../client
npm install
```

### 4. Setup Backend Environment Variables

Create a `.env` file inside the `server` folder.

```env
NODE_ENV=development
PORT=5000

MONGO_URI=your_mongodb_atlas_connection_string
CLIENT_URL=http://localhost:5173

JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret
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

TURNSTILE_SECRET_KEY=your_turnstile_secret_key
GOOGLE_CLIENT_ID=your_google_client_id

OTP_EXPIRES_MINUTES=10
OTP_RESEND_COOLDOWN_SECONDS=60
OTP_MAX_ATTEMPTS=5
```

### 5. Setup Frontend Environment Variables

Create a `.env` file inside the `client` folder.

```env
VITE_APP_NAME=Affinity Hub
VITE_API_BASE_URL=http://localhost:5000/api
VITE_TURNSTILE_SITE_KEY=your_turnstile_site_key
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

### 6. Run Backend Locally

```bash
cd server
npm run dev
```

Backend runs on:

```bash
http://localhost:5000
```

Health check:

```bash
http://localhost:5000/api/health
```

### 7. Run Frontend Locally

Open another terminal:

```bash
cd client
npm run dev
```

Frontend runs on:

```bash
http://localhost:5173
```

---

## Seed Data

The project includes seed data for demo and evaluation.

To run seed data:

```bash
cd server
npm run seed
```

The seed script creates:

* Admin account
* Demo users
* Interests
* User interest selections
* Follow relationships
* Posts
* Post interest tags
* Likes
* Comments
* Notifications
* Reports
* Bans
* Appeals

### Seed Login Credentials

**Admin**

```text
Email: admin@affinityhub.demo
Password: Admin@123456
```

**Normal User**

```text
Email: furqan@affinityhub.demo
Password: Demo@123456
```

---

## Available Scripts

### Frontend

```bash
npm run dev
```

Runs the frontend development server.

```bash
npm run build
```

Creates a production build.

```bash
npm run preview
```

Previews the production build locally.

### Backend

```bash
npm run dev
```

Runs the backend server using Nodemon.

```bash
npm start
```

Runs the backend server normally.

```bash
npm run seed
```

Seeds the database with demo data.

---

## Deployment

### Frontend Deployment

The frontend is deployed on Vercel.

Important settings:

* Root Directory: `client`
* Build Command: `npm run build`
* Output Directory: `dist`

Required environment variables:

* `VITE_API_BASE_URL`
* `VITE_TURNSTILE_SITE_KEY`
* `VITE_GOOGLE_CLIENT_ID`

### Backend Deployment

The backend is deployed on Render.

Important settings:

* Root Directory: `server`
* Build Command: `npm install`
* Start Command: `npm start`

Required environment variables:

* `NODE_ENV`
* `MONGO_URI`
* `CLIENT_URL`
* `JWT_ACCESS_SECRET`
* `JWT_REFRESH_SECRET`
* `CLOUDINARY_CLOUD_NAME`
* `CLOUDINARY_API_KEY`
* `CLOUDINARY_API_SECRET`
* `BREVO_API_KEY`
* `BREVO_SENDER_EMAIL`
* `BREVO_SENDER_NAME`
* `TURNSTILE_SECRET_KEY`
* `GOOGLE_CLIENT_ID`

---

## Error Handling and Feedback

Affinity Hub includes:

* Toast messages for success/error feedback
* Loading states for async actions
* API error responses through centralized error middleware
* Server-side validation before database operations
* Protected route redirects for unauthorized users
* Admin-only access protection

---

## Future Improvements

* Real-time notifications using Socket.IO
* Direct messaging between users
* Saved posts
* Hashtags and mentions
* Infinite scrolling
* Advanced recommendation algorithm
* User-selectable timezone preferences such as PKT
* PWA support
* More detailed analytics for admin dashboard
* Automated testing

---

## Project Status

Affinity Hub is deployed and functional as a complete MERN social media platform with authentication, onboarding, posting, stories, notifications, search, reports, bans, appeals, admin moderation, interest-based discovery, responsive UI, and cloud deployment.

---

## Author

**Muhammad Furqan Arshad**

Project: Affinity Hub
Category: Full Stack MERN Social Media Application
