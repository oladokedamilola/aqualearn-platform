# 🐟 AquaLearn

## *Learn aquaculture. Grow your future.*

---

## 📖 About The Project

AquaLearn is an accessible, mobile-first online learning platform dedicated to empowering fish farmers in Nigeria with practical aquaculture knowledge. The platform delivers video tutorials, interactive quizzes, and verifiable certifications to help both aspiring and existing small-scale farmers improve their fish farming practices.

Accessible anytime, anywhere — even with limited internet connectivity — AquaLearn brings expert knowledge directly to the farmers who need it most.

---

## 🎯 Mission

To empower Nigerian fish farmers with practical, accessible aquaculture education that improves livelihoods, increases productivity, and builds a sustainable future for the aquaculture industry.

---

## 🌟 Key Features

### 📚 Courses & Lessons
- Curated video tutorials from experienced aquaculture professionals
- Structured lessons with clear learning objectives
- Multiple difficulty levels: Beginner, Intermediate, Advanced
- Course tracking with visual progress indicators

### 📝 Interactive Quizzes
- 3-5 multiple-choice questions per lesson
- Immediate feedback on answers
- 70% pass threshold to advance
- One retry allowed per quiz attempt

### 🎥 Video Learning
- Embedded YouTube player for seamless viewing
- Watch-time tracking with 80% threshold to unlock quizzes
- Progress saved automatically
- Works on slow internet connections

### 📊 User Dashboard
- Personalized progress dashboard
- Continue learning quick access
- Course completion statistics
- Recent activity feed

### 🎓 Certificate System
- Dynamic PDF certificate generation
- Unique certificate IDs for verification
- Download and print functionality
- Shareable achievement badges

### 🔐 Authentication
- Secure JWT-based authentication
- Phone number registration option
- Profile management with experience levels
- Password reset functionality

---

## 🛠️ Technology Stack

### Backend
| Technology | Purpose |
|------------|---------|
| **Django 4.2** | Primary web framework |
| **Django REST Framework** | API development |
| **JWT Authentication** | Secure user authentication |
| **SQLite** | Development database |

### Frontend
| Technology | Purpose |
|------------|---------|
| **React 18** | Frontend library |
| **Vite** | Build tool and dev server |
| **Tailwind CSS** | Styling and responsive design |
| **React Router** | Navigation and routing |
| **Axios** | HTTP client for API requests |
| **React Query** | Data fetching and caching |
| **React Hook Form** | Form handling and validation |
| **React PDF Renderer** | Certificate generation |
| **React Toastify** | User notifications |

### Design System
| Element | Specification |
|---------|---------------|
| **Primary Color** | Deep Ocean Blue (#0A3D62) |
| **Secondary Color** | Clear Water Teal (#00B894) |
| **Accent Color** | Coral Reef Orange (#FF6B4A) |
| **Typography** | Poppins (Google Fonts) |
| **Design Approach** | Mobile-first, WCAG accessible |

---

## 🎨 Brand Identity

AquaLearn's brand embodies five core values:

| Value | Description |
|-------|-------------|
| **Trustworthy** | Reliable, accurate information farmers can count on |
| **Approachable** | Welcoming to beginners and small-scale farmers |
| **Empowering** | Enables users to improve their livelihoods |
| **Modern** | Leverages technology for real-world solutions |
| **Caring** | Genuinely invested in farmer success |

---

## 📱 Mobile-First Approach

AquaLearn is designed with mobile users in mind:

- Fully responsive layout for all screen sizes
- Optimized for slow internet connections
- Bottom navigation for easy thumb access
- Touch-friendly interface elements
- Progressive enhancement for offline support

---

## 🔒 Security Features

- JWT-based authentication with token refresh
- Password hashing with Django's built-in PBKDF2
- CORS configuration for secure cross-origin requests
- Rate limiting on authentication endpoints
- Environment variables for sensitive data
- HTTPS-ready configuration

---

## 🌍 Target Audience

- **Aspiring Fish Farmers** - New to aquaculture, seeking foundational knowledge
- **Small-Scale Farmers** - Looking to improve existing practices
- **Agricultural Students** - Supplementing formal education
- **Agripreneurs** - Exploring fish farming business opportunities

---

## 📈 Impact Goals

1. **Knowledge Access** - Bridge the gap between experts and small-scale farmers
2. **Livelihood Improvement** - Help farmers increase yields and income
3. **Industry Growth** - Strengthen Nigeria's aquaculture sector
4. **Youth Employment** - Create awareness of fish farming as a career
5. **Food Security** - Contribute to sustainable protein production

---

## 🏗️ Project Structure
fish-farming-tutorial/
├── backend/
│ ├── aqualearn/ # Django project config
│ ├── apps/ # Django applications
│ │ ├── users/ # Authentication & profiles
│ │ ├── courses/ # Course & lesson management
│ │ ├── progress/ # User progress tracking
│ │ └── certificates/ # Certificate generation
│ ├── manage.py
│ └── requirements.txt
│
├── frontend/
│ ├── src/
│ │ ├── components/ # Reusable UI components
│ │ ├── pages/ # Page components
│ │ ├── services/ # API call functions
│ │ ├── contexts/ # React context providers
│ │ ├── hooks/ # Custom React hooks
│ │ └── utils/ # Helper functions
│ ├── package.json
│ └── vite.config.js
│
└── README.md



---

## 🚀 Roadmap

### Phase 0: Environment Setup ✅
- Development environment configured
- Django backend initialized
- React frontend initialized

### Phase 1: Authentication System
- Custom user model with phone & experience level
- JWT authentication
- Registration and login pages

### Phase 2: Course & Lesson Management
- Course creation and management
- Lesson structure with video content
- Quiz question management

### Phase 3: Learning Experience
- Video player integration
- Watch-time tracking
- Interactive quiz system
- Lesson unlocking

### Phase 4: User Dashboard
- Personalized dashboard
- Progress tracking
- Course enrollment

### Phase 5: Certificate System
- PDF certificate generation
- Unique certificate IDs
- Download and verification

### Phase 6: Testing & QA
- Unit and integration tests
- User acceptance testing

### Phase 7: Deployment
- Production deployment
- SSL configuration
- Launch activities

### Phase 8: Maintenance
- Monitoring and analytics
- Content updates
- User support

---

## 📝 License

This project is proprietary software. All rights reserved.

© 2026 AquaLearn. All rights reserved.

---


*Empowering Nigerian fish farmers through accessible aquaculture education.*