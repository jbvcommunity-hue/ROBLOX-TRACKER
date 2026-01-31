# 🎮 ROBLOX TRACKER - GitHub Pages Setup Guide

## 🚀 Quick Setup (3 Steps)

### Step 1: Configure Your Backend URL

Open `config.js` and replace `YOUR_BACKEND_URL_HERE` with your actual backend server URL:

```javascript
const CONFIG = {
    BACKEND_URL: 'https://your-backend-server.com',  // ← CHANGE THIS!
};
```

**Examples of backend URLs:**
- Heroku: `https://your-app.herokuapp.com`
- Render: `https://your-app.onrender.com`
- Replit: `https://your-repl.username.repl.co`
- Railway: `https://your-app.up.railway.app`
- Your own server: `https://api.yoursite.com`

### Step 2: Enable GitHub Pages

1. Go to your repository settings
2. Click "Pages" in the left sidebar
3. Under "Source", select your main branch
4. Click "Save"
5. Your site will be at: `https://your-username.github.io/ROBLOX-TRACKER/`

### Step 3: Create a Favicon (Optional)

The site references `favicon.png`. To create one:

**Option A - Use an online tool:**
1. Go to https://favicon.io/favicon-converter/
2. Upload any image or use the `favicon.svg` included
3. Download the favicon.png
4. Add it to your repository

**Option B - Use the SVG:**
The `favicon.svg` file is already included and will work in most modern browsers.

---

## 📱 How The Site Works

### Different Pages

Your ROBLOX Tracker now has **3 separate pages**:

1. **`/log-in.html`** - Login page
   - URL: `https://your-username.github.io/ROBLOX-TRACKER/log-in.html`
   - Users enter username and password
   - Redirects to main app after successful login

2. **`/sign-up.html`** - Signup page
   - URL: `https://your-username.github.io/ROBLOX-TRACKER/sign-up.html`
   - Users create new accounts
   - Redirects to login page after successful signup

3. **`/index.html`** - Main dashboard (home page)
   - URL: `https://your-username.github.io/ROBLOX-TRACKER/`
   - Shows stats, games, and features
   - Only accessible when logged in
   - Auto-redirects to login if not authenticated

### Authentication Flow

```
User visits site
    ↓
Check if logged in?
    ↓
NO → Redirect to /log-in.html
    ↓
Login successful?
    ↓
YES → Redirect to / (main dashboard)
    ↓
User can browse, search games, etc.
    ↓
Click Logout → Redirect to /log-in.html
```

---

## 🔧 Troubleshooting Network Errors

### "Network error" when logging in/signing up?

This means the frontend can't connect to your backend. Here's how to fix it:

#### Check 1: Is your backend server running?
- Make sure your backend server is actually online
- Visit your backend URL in a browser - you should see something (not a "site not found" error)

#### Check 2: Is the backend URL correct in config.js?
```javascript
// ❌ WRONG
BACKEND_URL: 'YOUR_BACKEND_URL_HERE'

// ✅ CORRECT
BACKEND_URL: 'https://my-backend.herokuapp.com'
```

#### Check 3: CORS Configuration
Your backend must allow requests from your GitHub Pages domain. In your `server.js`:

```javascript
const cors = require('cors');

app.use(cors({
    origin: [
        'https://your-username.github.io',
        'http://localhost:3000'  // for local testing
    ],
    credentials: true
}));
```

#### Check 4: HTTPS Requirement
GitHub Pages uses HTTPS. Make sure your backend also uses HTTPS (not HTTP).

#### Check 5: Browser Console
1. Press F12 to open developer tools
2. Go to Console tab
3. Look for error messages
4. Common errors:
   - `CORS error` → Fix CORS on backend
   - `Failed to fetch` → Backend is offline
   - `404` → Wrong backend URL

---

## 🎨 ROBLOX Theme

The site now uses **official ROBLOX colors and design**:

### Colors
- **ROBLOX Red**: `#E1282D` (primary accent)
- **ROBLOX Blue**: `#0066FF` (secondary accent)
- **Light Gray**: `#F2F4F5` (background)
- **Black**: `#191919` (text)

### Design Elements
- ✅ Rotated square logo (ROBLOX style)
- ✅ Bold, blocky design
- ✅ Roboto font (similar to ROBLOX)
- ✅ Clean, modern interface
- ✅ Red and blue color scheme throughout

---

## 📁 File Structure

```
ROBLOX-TRACKER/
├── index.html          ← Main dashboard (requires login)
├── log-in.html         ← Login page (/log-in.html)
├── sign-up.html        ← Signup page (/sign-up.html)
├── style.css           ← ROBLOX themed CSS
├── app.js              ← Frontend logic
├── config.js           ← ⚠️ CONFIGURE YOUR BACKEND URL HERE
├── favicon.svg         ← Site icon
├── favicon.png         ← (optional, you can create this)
└── README.md           ← This file
```

**Server files (for your backend):**
```
├── server.js           ← Your backend server
├── db-schema.js        ← Database schemas
├── auth-config.js      ← Auth utilities
└── package.json        ← Backend dependencies
```

---

## 🌐 Local Testing

To test locally before deploying to GitHub Pages:

### Method 1: Python Server
```bash
# In the project folder
python -m http.server 8000

# Visit: http://localhost:8000
```

### Method 2: VS Code Live Server
1. Install "Live Server" extension
2. Right-click `index.html`
3. Select "Open with Live Server"

### Method 3: Node.js Server
```bash
npm install -g http-server
http-server

# Visit: http://localhost:8080
```

**Don't forget:** Your backend server must also be running for login/signup to work!

---

## ✅ Deployment Checklist

Before deploying to GitHub Pages:

- [ ] Backend server is online and working
- [ ] config.js has correct BACKEND_URL
- [ ] Backend has CORS configured for your GitHub Pages domain
- [ ] Backend uses HTTPS (required for GitHub Pages)
- [ ] favicon.png created (optional but recommended)
- [ ] Tested locally and everything works
- [ ] All files committed to GitHub
- [ ] GitHub Pages enabled in repository settings

---

## 🔐 Security Notes

### Important Security Information:

1. **Never commit `.env` files** to GitHub
   - These contain secret keys
   - Only your backend needs `.env`
   - Frontend (GitHub Pages) doesn't use `.env`

2. **config.js is public**
   - Your backend URL will be visible
   - This is okay - URLs are meant to be public
   - Just don't put passwords or API keys in config.js

3. **Authentication**
   - Passwords are hashed with bcrypt on the backend
   - JWT tokens are used for sessions
   - Tokens stored in localStorage (industry standard)

---

## 🎯 Common Questions

### Q: Where do I put my database?
**A:** On your backend server (Heroku, Render, etc.), not GitHub Pages. GitHub Pages only hosts static files (HTML, CSS, JS).

### Q: Why separate login and signup pages?
**A:** You requested different URLs like `/log-in` and `/sign-up` instead of having them on the same page. This is cleaner and more professional.

### Q: Can I use this without a backend?
**A:** No, authentication requires a backend server with a database. The frontend (GitHub Pages) just displays the UI.

### Q: How do I add my backend URL?
**A:** Edit `config.js` and replace `'YOUR_BACKEND_URL_HERE'` with your actual backend URL.

### Q: The site icon isn't showing?
**A:** Create a `favicon.png` file (16x16 or 32x32 pixels) and add it to your repository. Or just use the `favicon.svg` that's included.

---

## 🎨 Customization

### Change Colors
Edit `style.css` around line 10:
```css
:root {
    --roblox-red: #E1282D;     /* Change to your color */
    --roblox-blue: #0066FF;    /* Change to your color */
}
```

### Change Site Name
Edit all three HTML files and replace "ROBLOX TRACKER" with your name.

### Add More Games
Edit `app.js` around line 225 - add games to the array.

---

## 📞 Support

Still having issues? Check:

1. Browser console (F12) for errors
2. Network tab in developer tools
3. Your backend server logs
4. CORS configuration
5. config.js has correct URL

---

**Made with ❤️ for ROBLOX fans**

*This project is not affiliated with or endorsed by Roblox Corporation.*
