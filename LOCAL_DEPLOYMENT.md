# BookMyHotel Local Deployment Guide

## 🚀 Quick Start

Your BookMyHotel application is now ready for local deployment! The backend and frontend are currently running.

### Current Status
- ✅ **Backend**: Running on http://localhost:8080 (Spring Boot + MySQL)
- ✅ **Frontend**: Running on http://localhost:3000 (React)
- ✅ **Database**: MySQL running on port 3307
- ✅ **Hybrid Booking**: Supports both authenticated and anonymous guests

## 📋 Prerequisites

- Java 21+
- Node.js 16+
- Docker & Docker Compose
- Maven

## 🎯 Local Deployment Options

### Option 1: Using VS Code Tasks (Recommended)
Use the built-in VS Code tasks from the Command Palette (Cmd+Shift+P):
1. `Tasks: Run Task` → `Start MySQL Only`
2. `Tasks: Run Task` → `Start Backend`
3. `Tasks: Run Task` → `Start Frontend`

### Option 2: Using Start Script
```bash
./start-local.sh
```

### Option 3: Manual Steps
```bash
# 1. Start MySQL
docker-compose -f infra/docker-compose.yml up -d mysql

# 2. Start Backend (in new terminal)
cd backend && mvn spring-boot:run

# 3. Start Frontend (in new terminal)  
cd frontend && npm start
```

## 🛑 Stopping Services

### Stop All Services
```bash
./stop-local.sh
```

### Stop Individual Services
```bash
# Stop MySQL
docker-compose -f infra/docker-compose.yml down

# Stop Backend/Frontend
# Use Ctrl+C in their respective terminals
```

## 🌐 Access Points

| Service | URL | Purpose |
|---------|-----|---------|
| Frontend | http://localhost:3000 | Main application |
| Backend API | http://localhost:8080 | REST API endpoints |
| Health Check | http://localhost:8080/actuator/health | Backend health status |
| API Docs | http://localhost:8080/swagger-ui.html | API documentation |
| Database | localhost:3307 | MySQL database |

## 🔧 Development Tools

### Database Management
```bash
# Start PHPMyAdmin
docker-compose -f infra/docker-compose.yml --profile dev up -d phpmyadmin
# Access at: http://localhost:8081
# Username: root, Password: password
```

### Monitoring (Optional)
```bash
# Start Prometheus & Grafana
docker-compose -f infra/docker-compose.yml --profile monitoring up -d
# Grafana: http://localhost:3001 (admin/admin123)
# Prometheus: http://localhost:9090
```

## 🏨 Testing Your Deployment

### 1. Backend Health Check
```bash
curl http://localhost:8080/actuator/health
```

### 2. Test Hotel Search (Anonymous)
```bash
curl "http://localhost:8080/api/hotels/search?city=NYC&checkIn=2025-09-01&checkOut=2025-09-03&guests=2"
```

### 3. Frontend Access
Open http://localhost:3000 in your browser

## 🔐 Authentication Features

Your application supports **hybrid booking**:

### For Authenticated Users
- Login/Register functionality
- Profile management
- Booking history
- Easy cancellation/modification

### For Anonymous Guests
- Search and book without registration
- Receive management URL via email
- Access reservation details via secure token

## 📁 Important Directories

```
bookmyhotel/
├── backend/           # Spring Boot application
├── frontend/          # React application
├── infra/            # Docker & infrastructure
├── start-local.sh    # Start script
├── stop-local.sh     # Stop script
└── README.md         # This file
```

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Check what's using port 8080
lsof -i :8080

# Kill process if needed
kill -9 <PID>
```

### Database Connection Issues
```bash
# Restart MySQL
docker-compose -f infra/docker-compose.yml restart mysql

# Check MySQL logs
docker-compose -f infra/docker-compose.yml logs mysql
```

### Frontend Won't Start
```bash
# Reinstall dependencies
cd frontend && rm -rf node_modules package-lock.json && npm install
```

### Backend Compilation Issues
```bash
# Clean and rebuild
cd backend && mvn clean compile
```

## 🔄 Development Workflow

1. **Start Services**: Use VS Code tasks or `./start-local.sh`
2. **Make Changes**: Edit code in VS Code
3. **Hot Reload**: 
   - Frontend: Automatic refresh
   - Backend: Use Spring Boot DevTools (automatic restart)
4. **Test**: Use the endpoints above
5. **Stop**: `./stop-local.sh` or Ctrl+C

## 🚀 Next Steps

- **Production Deployment**: See `deploy-azure.sh` for Azure deployment
- **Email Configuration**: Update email settings in `application.properties`
- **Payment Integration**: Configure Stripe keys for payments
- **Custom Domain**: Set up custom domain and SSL

## 📧 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review the console logs in VS Code terminal
3. Check Docker container logs: `docker-compose -f infra/docker-compose.yml logs`

---

**Happy Coding! 🎉**
