# ROBLOX-TRACKER

A web application for tracking ROBLOX games with live player counts, user authentication, and developer connection features.

## Features

- 🔐 User Authentication (Google OAuth & Manual Login)
- 📊 Live Player Count Tracking
- 👥 Developer Connection Panel
- 💾 Session Management
- 🎮 Game Data Analytics
- 🔒 Secure Password Hashing
- 📱 Responsive Design

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- Firebase account (for frontend authentication)
- Google OAuth credentials (optional)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/jbvcommunity-hue/ROBLOX-TRACKER.git
cd ROBLOX-TRACKER
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

4. Edit `.env` file with your credentials:
   - Add MongoDB URI
   - Add JWT secret
   - Add Google OAuth credentials (optional)
   - Add Firebase credentials

## Usage

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The server will start on `http://localhost:3000` (or your specified PORT).

## Project Structure

```
ROBLOX-TRACKER/
├── server.js              # Main server file with Express routes
├── index.html             # Main frontend HTML
├── script.js              # Frontend JavaScript logic
├── style.css              # Styling
├── auth-config.js         # Authentication configuration
├── db-schema.js           # MongoDB schemas
├── live-ccp-updates.js    # Live player count updates
├── package.json           # Dependencies
└── .env.example           # Environment variables template
```

## API Endpoints

### Authentication
- `POST /signup` - Create new user account
- `POST /login` - User login
- `POST /logout` - User logout
- `GET /auth/google/callback` - Google OAuth callback

### User Management
- `GET /profile` - Get user profile (protected)
- `DELETE /account` - Delete user account (protected)

### Game Data
- `GET /games` - Get game data
- `GET /api/players` - Get live player count

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- CORS protection
- Environment variable configuration
- Session token management

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is open source and available under the MIT License.

## Author

**jbvcommunity-hue**

## Issues Fixed (Latest Update)

✅ Fixed package.json dependency mismatch (bcrypt vs bcryptjs)  
✅ Fixed CSS file reference (styles.css → style.css)  
✅ Fixed escaped newlines in HTML  
✅ Added missing Express dependency  
✅ Added missing CORS dependency  
✅ Improved server error handling  
✅ Added .hidden CSS class  
✅ Updated .env.example with complete configuration  

## Support

For issues and questions, please open an issue on GitHub.
