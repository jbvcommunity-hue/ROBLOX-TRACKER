# 🎮 ROBLOX TRACKER

A modern, professional web application for tracking ROBLOX games with live player counts, user authentication, and real-time analytics.

![Version](https://img.shields.io/badge/version-2.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## ✨ Features

- 🔐 **Complete Authentication System**
  - Manual login/signup with email
  - Secure password hashing (bcrypt)
  - JWT token-based sessions
  - Session persistence

- 📊 **Live Game Analytics**
  - Real-time player count tracking
  - Animated counter updates
  - Game search functionality
  - Trending games display

- 🎨 **Modern UI/UX**
  - Dark theme with gradient accents
  - Smooth animations and transitions
  - Responsive design (mobile-friendly)
  - Glass-morphism effects
  - Professional color scheme

- 👥 **User Features**
  - Personal dashboard
  - Game favorites tracking
  - User statistics
  - Developer panel integration

- 🔒 **Security**
  - Password hashing with bcrypt
  - JWT authentication
  - CORS protection
  - Environment variable configuration
  - Input validation

## 🚀 Quick Start

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud)
- npm or yarn

### Installation

1. **Clone the repository:**
```bash
git clone https://github.com/jbvcommunity-hue/ROBLOX-TRACKER.git
cd ROBLOX-TRACKER
```

2. **Install dependencies:**
```bash
npm install
```

3. **Configure environment:**
```bash
cp .env.example .env
```

Edit `.env` and add your MongoDB URI and JWT secret:
```env
MONGODB_URI=mongodb://localhost:27017/roblox-tracker
JWT_SECRET=your_super_secret_key_min_32_characters
PORT=3000
```

4. **Start MongoDB** (if using local installation):
```bash
mongod
```

5. **Run the application:**
```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

6. **Open your browser:**
```
http://localhost:3000
```

## 📱 Usage

### First Time Setup

1. Open the app in your browser
2. Click "Sign up here" on the login screen
3. Create an account with:
   - Username
   - Email
   - Password (minimum 6 characters)
4. After signup, log in with your credentials
5. Start tracking your favorite ROBLOX games!

### Features Walkthrough

- **Dashboard**: View live statistics and trending games
- **Search**: Find specific games using the search bar
- **Live Updates**: Player counts update automatically every 5 seconds
- **Developer Panel**: Connect your developer account for advanced features

## 🏗️ Project Structure

```
ROBLOX-TRACKER/
├── index.html           # Main HTML file with modern UI
├── style.css            # Professional styling with animations
├── app.js               # Frontend logic and API calls
├── server.js            # Express server with API endpoints
├── auth-config.js       # Authentication utilities
├── db-schema.js         # MongoDB schemas
├── package.json         # Dependencies
├── .env.example         # Environment variables template
├── README.md            # This file
└── SETUP_GUIDE.md       # Detailed setup instructions
```

## 🔌 API Endpoints

### Authentication
- `POST /signup` - Create new user account
- `POST /login` - User login (returns JWT token)
- `POST /logout` - User logout
- `GET /auth/google/callback` - Google OAuth (optional)

### User Management
- `GET /profile` - Get user profile (requires auth)
- `DELETE /account` - Delete user account (requires auth)

### Game Data
- `GET /games` - Get game list
- `GET /api/players` - Get live player count

## 🎨 Design Features

### Color Scheme
- **Primary**: Cyan/Blue (#00d9ff)
- **Secondary**: Pink/Red (#ff4081)
- **Success**: Green (#00e676)
- **Background**: Dark Navy (#0a0e27)

### Animations
- Smooth fade-in effects
- Number counter animations
- Hover transformations
- Loading spinners
- Shake effect on errors

### Responsive Design
- Mobile-first approach
- Breakpoints at 768px
- Touch-friendly buttons
- Adaptive layouts

## 🔧 Configuration

### Environment Variables

Create a `.env` file with:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/roblox-tracker

# Authentication
JWT_SECRET=your_secret_key_here

# Server
PORT=3000
NODE_ENV=development

# Optional: Google OAuth
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
```

### Customization

**Change Colors**: Edit CSS variables in `style.css`:
```css
:root {
    --primary: #00d9ff;
    --secondary: #ff4081;
    /* ... */
}
```

**Modify Player Update Interval**: Edit `app.js`:
```javascript
playerCountInterval = setInterval(updatePlayerCount, 5000); // 5 seconds
```

## 🧪 Testing

### Test Authentication

1. Create a test account through the UI
2. Or use cURL:

```bash
# Signup
curl -X POST http://localhost:3000/signup \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"password123"}'

# Login
curl -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"password123"}'
```

## 📊 Current Status

✅ **Working:**
- Complete authentication system
- Modern UI/UX
- Live player count updates
- Game display and search
- Responsive design
- Session management

🚧 **In Development:**
- Roblox API integration
- Google OAuth
- Advanced analytics
- Game favorites system
- User preferences

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**jbvcommunity-hue**
- GitHub: [@jbvcommunity-hue](https://github.com/jbvcommunity-hue)

## 🙏 Acknowledgments

- Roblox for game data
- Font: Poppins from Google Fonts
- Icons: Emoji-based for simplicity

## 📞 Support

For issues or questions:
- Open an issue on GitHub
- Check the [SETUP_GUIDE.md](SETUP_GUIDE.md) for troubleshooting

---

**Made with ❤️ by jbvcommunity-hue**

