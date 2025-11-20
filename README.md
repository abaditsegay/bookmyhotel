# BookMyHotel - Multi-Tenant Hotel Booking Platform

A production-ready, multi-tenant hotel booking application built with Spring Boot (Java 21), React (TypeScript), and MySQL 8. This application implements enterprise-grade features including RBAC, multi-tenancy, payment processing, and comprehensive observability.

## 🚀 Features

### Core Features
- **Multi-Tenancy**: Shared database with strict row-level isolation
- **Authentication & Authorization**: JWT-based auth with Spring Security RBAC
- **Payment Processing**: Stripe integration with webhooks
- **Booking Management**: Room availability, reservations, and booking flow
- **Responsive UI**: Modern React TypeScript frontend with Material-UI

### Technical Features
- **Database Migrations**: Flyway for version-controlled schema management
- **Observability**: Micrometer metrics, structured logging with MDC
- **Testing**: JUnit5, Testcontainers, concurrency testing
- **Docker Support**: Complete containerized development environment
- **Code Quality**: DTO validation, error handling, proper indexing

## 🏗️ Architecture

### Multi-Tenancy Strategy
- **Shared Database, Shared Schema**: Single database with tenant isolation via `tenant_id`
- **Tenant Resolution**: Subdomain or `X-Tenant-Id` header mapping
- **Row-Level Security**: Hibernate filters auto-applied to all tenant-scoped entities
- **Auto-Population**: `tenant_id` automatically set on entity creation

### Role-Based Access Control
- **CUSTOMER**: Book rooms, view own reservations
- **FRONTDESK**: Check-in/out, manage reservations
- **HOUSEKEEPING**: Room status updates, maintenance
- **HOTEL_ADMIN**: Manage hotel, rooms, staff
- **HOTEL_MANAGER**: Analytics, reporting, hotel operations
- **PLATFORM_ADMIN**: System administration, tenant management

## 📁 Project Structure

```
├── backend/              # Spring Boot API
│   ├── src/main/java/com/bookmyhotel/
│   │   ├── entity/       # JPA entities with tenant support
│   │   ├── tenant/       # Multi-tenancy infrastructure
│   │   ├── repository/   # Data access layer
│   │   ├── service/      # Business logic
│   │   ├── controller/   # REST endpoints
│   │   ├── security/     # Authentication & authorization
│   │   ├── payment/      # Stripe integration
│   │   └── config/       # Spring configuration
│   ├── src/main/resources/
│   │   └── db/migration/ # Flyway migrations
│   └── Dockerfile
├── frontend/             # React TypeScript SPA
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── pages/        # Route components
│   │   ├── contexts/     # React contexts (Auth, Tenant)
│   │   ├── hooks/        # Custom React hooks
│   │   ├── services/     # API client
│   │   └── types/        # TypeScript definitions
│   └── Dockerfile
└── infra/
    └── docker-compose.yml
```

## 🚦 Getting Started

### Prerequisites
- Docker & Docker Compose
- **Java 21 LTS** (required for backend development) - [See Java 21 setup guide](./JAVA_21_UPGRADE.md)
- Node.js 18+ (for frontend development)
- MySQL 8.0
- Maven 3.9+ (for backend development)

### Quick Start with Docker

1. **Clone and start services**:
   ```bash
   git clone <repository-url>
   cd bookmyhotel
   cp .env.example .env  # Configure environment variables
   docker-compose -f infra/docker-compose.yml up --build
   ```

2. **Access the application**:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8080
   - API Documentation: http://localhost:8080/swagger-ui.html
   - phpMyAdmin: http://localhost:8081 (dev profile)

3. **Default login credentials**:
   - Admin: `admin@grandplaza.com` / `password`
   - Manager: `manager@grandplaza.com` / `password`
   - Customer: `guest@example.com` / `password`

### Local Development

#### Backend
```bash
cd backend

# Ensure Java 21 is active (use one of these methods):
# Option 1: Source the setup script
source set-java-21.sh

# Option 2: Set JAVA_HOME manually
export JAVA_HOME=/Library/Java/JavaVirtualMachines/microsoft-21.jdk/Contents/Home

# Build and run
mvn spring-boot:run
```

> **Note**: For detailed Java 21 setup instructions, see [JAVA_21_UPGRADE.md](./JAVA_21_UPGRADE.md)

#### Frontend
```bash
cd frontend
npm install
npm start
```

## 🗄️ Database Schema

### Key Tables
- **tenants**: Tenant configuration and metadata
- **hotels**: Hotel information (tenant-scoped)
- **rooms**: Room inventory (tenant-scoped)
- **users**: User accounts with roles (tenant-scoped)
- **reservations**: Booking data (tenant-scoped)

### Tenant Isolation
All tenant-scoped tables include:
- `tenant_id VARCHAR(50) NOT NULL`
- Proper indexes on `(tenant_id, ...)`
- Hibernate `@Filter` annotations

## 💳 Payment Integration

### Stripe Configuration
1. Set environment variables:
   ```bash
   STRIPE_API_KEY=sk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_...
   ```

2. Configure webhook endpoint:
   - URL: `https://yourdomain.com/api/webhooks/stripe`
   - Events: `payment_intent.succeeded`, `payment_intent.payment_failed`

### Payment Flow
1. Customer selects room and dates
2. Frontend creates PaymentIntent via API
3. Customer completes payment with Stripe Elements
4. Webhook confirms payment and updates reservation status

## 🔧 Configuration

### Environment Variables

#### Backend
```bash
# Database
SPRING_DATASOURCE_URL=jdbc:mysql://localhost:3306/bookmyhotel
SPRING_DATASOURCE_USERNAME=root
SPRING_DATASOURCE_PASSWORD=password

# JWT
APP_JWT_SECRET=your-256-bit-secret-key
APP_JWT_EXPIRATION=86400000

# Microsoft Graph OAuth2 (for email service)
MICROSOFT_GRAPH_CLIENT_ID=your-azure-ad-client-id
MICROSOFT_GRAPH_TENANT_ID=your-azure-ad-tenant-id
MICROSOFT_GRAPH_CLIENT_SECRET=your-azure-ad-client-secret
APP_EMAIL_FROM=noreply@your-domain.com

# Stripe
STRIPE_API_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

#### Frontend
```bash
REACT_APP_API_URL=http://localhost:8080/api
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
```

**Note**: Copy `.env.example` to `.env` and configure your actual values. Never commit the `.env` file to version control.

## 🧪 Testing

### Backend Tests
```bash
cd backend
mvn test                     # Unit tests
mvn test -Dtest=*IT          # Integration tests
mvn test -Dtest=*ConcurrencyTest  # Concurrency tests
```

### Frontend Tests
```bash
cd frontend
npm test                     # Jest unit tests
npm run test:e2e            # Cypress e2e tests (if configured)
```

### Test Containers
Integration tests use Testcontainers for:
- MySQL database testing
- Isolated test environments
- Concurrency and race condition testing

## 📊 Monitoring & Observability

### Metrics (Micrometer + Prometheus)
- Application metrics: `/actuator/prometheus`
- Custom business metrics
- JVM and system metrics

### Logging
- Structured JSON logging
- MDC with `tenantId` for request tracing
- Configurable log levels per tenant

### Health Checks
- Application health: `/actuator/health`
- Database connectivity
- External service dependencies

### Development Tools
```bash
# Start with monitoring stack
docker-compose -f infra/docker-compose.yml --profile monitoring up

# Access monitoring
# Prometheus: http://localhost:9090
# Grafana: http://localhost:3001 (admin/admin123)
```

## 🚀 Deployment

### Production Checklist
- [ ] Configure production database
- [ ] Set secure JWT secret
- [ ] Configure Stripe webhook endpoints
- [ ] Enable HTTPS/TLS
- [ ] Configure monitoring and alerting
- [ ] Set up backup strategy
- [ ] Configure CDN for static assets
- [ ] Review security headers and CORS

### Docker Production Build
```bash
# Build production images
docker-compose -f infra/docker-compose.yml -f infra/docker-compose.prod.yml build

# Deploy
docker-compose -f infra/docker-compose.yml -f infra/docker-compose.prod.yml up -d
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Ensure all tests pass
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the GitHub repository
- Check the API documentation at `/swagger-ui.html`
- Review the application logs for debugging

---

Built with ❤️ using Spring Boot, React, and modern DevOps practices.
