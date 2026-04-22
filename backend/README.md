# ✈️ TravelMates

> **A full-stack social travel platform** where explorers connect, share journeys, and plan trips together.

![TravelMates](https://img.shields.io/badge/TravelMates-Live-teal?style=for-the-badge)
![React](https://img.shields.io/badge/React-18-blue?style=for-the-badge&logo=react)
![Django](https://img.shields.io/badge/Django-5.2-green?style=for-the-badge&logo=django)
![MySQL](https://img.shields.io/badge/MySQL-Aiven-orange?style=for-the-badge&logo=mysql)
![Cloudinary](https://img.shields.io/badge/Media-Cloudinary-blue?style=for-the-badge)

🌐 **Live Demo**: [https://travel-social-app.vercel.app](https://travel-social-app.vercel.app)  
🔧 **Backend API**: [https://travelmates-backend-kfs4.onrender.com](https://travelmates-backend-kfs4.onrender.com)

---

## 📸 Overview

TravelMates is a travel-focused social media application that allows users to:

- Share travel experiences with photos and day-by-day itineraries
- Post joinable trips and find travel companions
- Share 24-hour travel stories
- Explore destinations on an interactive map
- Connect with fellow travelers through direct messages and group chats
- Follow travelers and get a personalized feed

---

## 🚀 Features

### 👤 Authentication
- JWT-based secure login and registration
- Auto token refresh with 24-hour access tokens
- Protected routes and persistent sessions

### 📝 Three Post Types
| Type | Description |
|------|-------------|
| **Experience Post** | Multi-day trip journals with photos, locations, and day-by-day itineraries |
| **Joinable Trip** | Open trips others can request to join, with budget and member details |
| **General Post** | Quick photo posts with captions and location tags |

### 🗺️ Explore & Map
- Interactive Leaflet map showing all posts with location data
- Color-coded markers by post type (teal = experience, blue = joinable, purple = general)
- Search and filter by destination, budget, and post type

### 📖 Stories
- Instagram-style 24-hour expiring stories
- Story viewer with progress bars and viewer tracking
- Like and view count for own stories

### 💬 Messaging
- Real-time direct messages between users
- Trip group chats for accepted trip members
- Unread message indicators

### 🔔 Notifications
- Instagram-style notifications with post thumbnails
- Like, comment, follow, and join request notifications
- Comment preview in notifications
- Mark all as read

### 👥 Social Features
- Follow/unfollow users
- Mutual followers shown as "Mates"
- User profiles with travel stats and badges
- Search for users, posts, and trips

### 🛡️ Post Management
- Edit and delete all post types
- Pull-to-refresh on home feed
- Save/bookmark posts

---

## 🛠️ Tech Stack

### Frontend
- **React 18** with Vite
- **Tailwind CSS** for styling
- **React Router v6** for navigation
- **Axios** with JWT interceptors
- **Leaflet** for interactive maps
- **Swiper.js** for image carousels
- **Lucide React** for icons
- **Deployed on Vercel**

### Backend
- **Django 5.2** with Django REST Framework
- **Django Channels** for WebSocket support
- **SimpleJWT** for authentication
- **PyMySQL** for MySQL connectivity
- **Cloudinary** for media storage
- **Whitenoise** for static files
- **Gunicorn** WSGI server
- **Deployed on Render**

### Database & Storage
- **MySQL** via Aiven (cloud-hosted)
- **Cloudinary** for image uploads and delivery

---

## 📁 Project Structure

```
travel-social-app/
├── backend/
│   ├── core/
│   │   ├── settings.py
│   │   ├── urls.py
│   │   ├── wsgi.py
│   │   └── asgi.py
│   ├── api/
│   │   ├── models.py
│   │   ├── views.py
│   │   ├── serializers.py
│   │   ├── urls.py
│   │   └── consumers.py
│   ├── requirements.txt
│   └── Procfile
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Home.jsx
    │   │   ├── Profile.jsx
    │   │   ├── Stories.jsx
    │   │   ├── PostCard.jsx
    │   │   ├── Messages.jsx
    │   │   ├── Notification.jsx
    │   │   ├── Explore.jsx
    │   │   └── ...
    │   ├── api.js
    │   ├── utils.js
    │   └── main.jsx
    ├── vercel.json
    └── package.json
```

---

## ⚙️ Local Setup

### Prerequisites
- Python 3.11+
- Node.js 18+
- MySQL running locally

### Backend Setup

```bash
# Clone the repository
git clone https://github.com/gnaneshwar2380/travel-social-app.git
cd travel-social-app/backend

# Create virtual environment
python -m venv venv
venv\Scripts\activate  # Windows
source venv/bin/activate  # Mac/Linux

# Install dependencies
pip install -r requirements.txt

# Create local MySQL database
# In MySQL: CREATE DATABASE travel_mates_db;

# Run migrations
python manage.py migrate

# Start backend server
python manage.py runserver
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env.local file
echo "VITE_API_URL=http://127.0.0.1:8000/api" > .env.local

# Start frontend dev server
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## 🌐 Deployment

### Backend (Render)
- **Build Command**: `pip install -r requirements.txt && python manage.py collectstatic --noinput && python manage.py migrate`
- **Start Command**: `gunicorn core.wsgi:application --bind 0.0.0.0:$PORT`
- **Environment Variables**: `SECRET_KEY`, `DATABASE_URL`, `CLOUDINARY_*`, `DEBUG=False`

### Frontend (Vercel)
- **Framework**: Vite
- **Root Directory**: `frontend`
- **Environment Variables**: `VITE_API_URL`

---

## 🔑 Environment Variables

### Backend (Render)
| Variable | Description |
|----------|-------------|
| `SECRET_KEY` | Django secret key |
| `DEBUG` | `False` in production |
| `ALLOWED_HOSTS` | Your Render domain |
| `DATABASE_URL` | Aiven MySQL connection URI |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |

### Frontend (Vercel)
| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Backend API base URL |

---

## 📱 Screenshots

> Register → Login → Home Feed → Create Post → Explore Map → Messages → Notifications

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 👨‍💻 Author

**Gnaneshwar Yadav**  
GitHub: [@gnaneshwar2380](https://github.com/gnaneshwar2380)

---

## 📄 License

This project is licensed under the MIT License.

---

<p align="center">Made with ❤️ for travelers everywhere</p>