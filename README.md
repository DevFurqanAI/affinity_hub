## Deployment Notes: Render Backend + Vercel Frontend

### Production Architecture

- Backend: Render Web Service
- Frontend: Vercel Vite React App
- Database: MongoDB Atlas
- Images/Videos: Cloudinary
- Auth: JWT access token + HTTP-only refresh token cookie

---

## Backend Environment Variables

Set these in Render dashboard:

```env
NODE_ENV=production
PORT=10000
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/affinity-hub
CLIENT_URL=https://your-vercel-frontend-url.vercel.app
JWT_ACCESS_SECRET=replace_with_strong_access_secret
JWT_REFRESH_SECRET=replace_with_strong_refresh_secret
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
COOKIE_EXPIRES_DAYS=7
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret