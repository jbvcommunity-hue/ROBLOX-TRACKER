# ROBLOX TRACKER - Setup Guide

## Quick Start

This guide will help you get the ROBLOX Tracker up and running in minutes.

## Step 1: Install Dependencies

```bash
npm install
```

This will install all required packages:
- express - Web server framework
- bcrypt - Password hashing
- jsonwebtoken - JWT authentication
- mongoose - MongoDB ODM
- cors - Cross-origin resource sharing
- dotenv - Environment variable management
- google-auth-library - Google OAuth

## Step 2: Set Up MongoDB

### Option A: Local MongoDB
1. Install MongoDB on your system
2. Start MongoDB service:
   ```bash
   mongod
   ```
3. Use default connection: `mongodb://localhost:27017/roblox-tracker`

### Option B: MongoDB Atlas (Cloud)
1. Create account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a cluster
3. Get your connection string
4. Replace in `.env` file

## Step 3: Configure Environment Variables

1. Copy the example file:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` file:
   ```env
   MONGODB_URI=mongodb://localhost:27017/roblox-tracker
   JWT_SECRET=your_random_secret_here_min_32_chars
   PORT=3000
   ```

3. Generate a secure JWT secret:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

## Step 4: Configure Firebase (Frontend Auth)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable Authentication > Google Sign-in
4. Get your Firebase config
5. Update `index.html` with your Firebase credentials:

```javascript
const firebaseConfig = {
    apiKey: "YOUR_ACTUAL_API_KEY",
    authDomain: "your-project.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "123456789",
    appId: "your-app-id"
};
```

## Step 5: Set Up Google OAuth (Optional)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `http://localhost:3000/auth/google/callback`
6. Copy Client ID and Client Secret to `.env`:
   ```env
   GOOGLE_CLIENT_ID=your_client_id
   GOOGLE_CLIENT_SECRET=your_client_secret
   ```

## Step 6: Run the Application

### Development Mode (with auto-restart):
```bash
npm run dev
```

### Production Mode:
```bash
npm start
```

The app will be available at: `http://localhost:3000`

## Step 7: Test the Application

1. Open browser to `http://localhost:3000`
2. Click "Login with Google" (requires Firebase setup)
3. After login, you should see the dashboard with:
   - Live Player Count
   - Developer Connection Panel
   - Account Management

## Troubleshooting

### MongoDB Connection Error
- Make sure MongoDB is running
- Check MONGODB_URI in `.env`
- Verify network connectivity

### Port Already in Use
- Change PORT in `.env` to another port (e.g., 3001)
- Or kill the process using port 3000:
  ```bash
  # Linux/Mac
  lsof -ti:3000 | xargs kill
  
  # Windows
  netstat -ano | findstr :3000
  taskkill /PID [PID_NUMBER] /F
  ```

### Firebase Authentication Not Working
- Verify Firebase config in `index.html`
- Check Firebase console for enabled authentication methods
- Make sure domain is authorized in Firebase settings

### JWT Token Issues
- Make sure JWT_SECRET is set in `.env`
- Clear browser localStorage and try again
- Check token expiration time

## Testing API Endpoints

### Using cURL:

1. **Signup:**
```bash
curl -X POST http://localhost:3000/signup \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"password123","email":"test@example.com"}'
```

2. **Login:**
```bash
curl -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"password123"}'
```

3. **Get Profile (use token from login):**
```bash
curl -X GET http://localhost:3000/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Next Steps

1. Integrate Roblox API for real player counts
2. Add more game tracking features
3. Implement developer dashboard
4. Add analytics and charts
5. Deploy to production (Heroku, AWS, etc.)

## Production Deployment Checklist

- [ ] Change JWT_SECRET to a secure random string
- [ ] Use production MongoDB instance
- [ ] Enable HTTPS
- [ ] Set NODE_ENV=production
- [ ] Configure proper CORS origins
- [ ] Set up monitoring and logging
- [ ] Configure backup strategy
- [ ] Update Firebase authorized domains
- [ ] Update Google OAuth redirect URIs

## Support

If you encounter issues:
1. Check the console for error messages
2. Review the logs
3. Open an issue on GitHub
4. Check existing issues for solutions

---

**Happy tracking! 🎮**
