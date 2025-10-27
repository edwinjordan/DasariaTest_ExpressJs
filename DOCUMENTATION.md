# 🌐 ISP Management System API

> **Sistem Manajemen ISP yang Modular dan Scalable**  
> Dikembangkan menggunakan Express.js, MySQL, dan JWT Authentication  
> **Author**: Oskar Pra Andrea Sussetyo

## 📋 Overview

Aplikasi ISP Management System adalah sistem backend API yang dirancang untuk mengelola operasional Internet Service Provider (ISP) dengan fitur lengkap dan arsitektur yang modular. Sistem ini mengimplementasikan best practices dalam pengembangan API dengan Node.js dan Express.js.

## 🏗️ Arsitektur Sistem

### 📁 Struktur Folder
```
src/
├── config/          # Konfigurasi aplikasi (database, environment)
├── controllers/     # Business logic controllers
├── middleware/      # Custom middleware (auth, validation, error handling)
├── models/         # Database models dengan ORM-like pattern
├── repositories/   # Repository pattern untuk data access layer
├── routes/         # API routes definition
└── app.js          # Main application entry point

database/
├── schema.sql      # Database schema dengan sample data
├── seed.js         # Database seeder script
└── README.md       # Database setup guide

docs/               # Additional documentation
```

### 🔧 Design Patterns
- **Repository Pattern**: Pemisahan logic database dari controller
- **Middleware Pattern**: Chainable request processing
- **MVC Architecture**: Model-View-Controller dengan API responses
- **Singleton Pattern**: Database connection management

## 🌟 Fitur Utama

### 1. 👥 Manajemen Pengguna & Hak Akses (RBAC)
- **User Management**: CRUD operasi untuk pengguna sistem
- **Role-based Access Control**: 3 level role (Admin, Agent NOC, Customer Service)
- **Permission System**: Granular permissions untuk setiap fungsi
- **JWT Authentication**: Secure token-based authentication
- **Password Security**: Bcrypt hashing dengan salt

**Roles & Permissions:**
- **Admin**: Full system access
- **Agent NOC**: Network operations, ticket management
- **Customer Service**: Customer & ticket management

### 2. 🏠 Manajemen Pelanggan
- **Customer Profiles**: Data lengkap pelanggan dengan auto-generated customer code
- **Customer Search**: Advanced search dengan multiple criteria
- **Customer Status**: Active/inactive status management
- **Customer Statistics**: Dashboard metrics untuk customer insights

### 3. 📦 Manajemen Layanan & Langganan
- **Service Packages**: Paket layanan internet dengan berbagai kecepatan
- **Subscription Management**: Pengelolaan langganan pelanggan
- **Auto Code Generation**: Otomatis generate subscription code
- **Package Analytics**: Statistik penggunaan paket layanan

### 4. 🎫 Sistem Tiket Gangguan
- **Ticket Management**: Comprehensive ticket system dengan status tracking
- **Priority Levels**: 4 level prioritas (Low, Medium, High, Critical)
- **Status Workflow**: Open → In Progress → Resolved → Closed
- **Audit Trail**: Complete history tracking untuk setiap perubahan status
- **Assignment System**: Multi-user assignment dengan pivot table
- **Category Management**: Kategorisasi jenis gangguan

## 🔐 Security Features

### Authentication & Authorization
- **JWT Token**: Stateless authentication dengan expiration
- **Role-based Access**: Hierarchical permission system
- **Permission Gates**: Granular access control per endpoint
- **Token Refresh**: Secure token management

### Security Middleware
- **Helmet.js**: Security headers protection
- **CORS**: Cross-origin resource sharing configuration
- **Rate Limiting**: DDoS protection dengan configurable limits
- **Input Validation**: Express-validator untuk request validation
- **SQL Injection Prevention**: Parameterized queries
- **XSS Protection**: Input sanitization

## 📊 Database Design

### Entity Relationship
```
Users ←→ Roles ←→ Permissions (Many-to-Many)
Customers → Subscriptions → Service Packages
Customers → Tickets ← Users (assignment)
Tickets → Ticket Categories
Tickets → Ticket Status Histories (audit trail)
```

### Key Features
- **Normalized Design**: Properly normalized tables untuk data integrity
- **Foreign Key Constraints**: Referential integrity enforcement
- **Indexes**: Optimized queries dengan strategic indexing
- **Auto-increment IDs**: Consistent primary key strategy
- **Timestamps**: Created/updated tracking untuk audit

## 🚀 API Endpoints

### 🔑 Authentication
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/login` | User login | ❌ |
| POST | `/api/auth/register` | User registration | ❌ |
| GET | `/api/auth/me` | Get current user profile | ✅ |
| POST | `/api/auth/change-password` | Change password | ✅ |

### 👤 User Management
| Method | Endpoint | Description | Permission |
|--------|----------|-------------|------------|
| GET | `/api/users` | List all users | `users.view` |
| POST | `/api/users` | Create new user | `users.create` |
| GET | `/api/users/:id` | Get user by ID | `users.view` |
| PUT | `/api/users/:id` | Update user | `users.update` |
| DELETE | `/api/users/:id` | Delete user | `users.delete` |
| POST | `/api/users/:id/assign-role` | Assign role | `users.update` |

### 🏠 Customer Management
| Method | Endpoint | Description | Permission |
|--------|----------|-------------|------------|
| GET | `/api/customers` | List customers | `customers.view` |
| POST | `/api/customers` | Create customer | `customers.create` |
| GET | `/api/customers/:id` | Get customer details | `customers.view` |
| PUT | `/api/customers/:id` | Update customer | `customers.update` |
| DELETE | `/api/customers/:id` | Delete customer | `customers.delete` |
| GET | `/api/customers/stats` | Customer statistics | `customers.view` |

### 🎫 Ticket Management
| Method | Endpoint | Description | Permission |
|--------|----------|-------------|------------|
| GET | `/api/tickets` | List all tickets | `tickets.view` |
| POST | `/api/tickets` | Create new ticket | `tickets.create` |
| GET | `/api/tickets/:id` | Get ticket details | `tickets.view` |
| PUT | `/api/tickets/:id` | Update ticket | `tickets.update` |
| POST | `/api/tickets/:id/status` | Update ticket status | `tickets.update` |
| POST | `/api/tickets/:id/assign` | Assign ticket | `tickets.update` |
| GET | `/api/tickets/my` | My assigned tickets | `tickets.view` |

## 📈 Advanced Features

### Pagination & Search
- **Consistent Pagination**: Standardized pagination across all endpoints
- **Advanced Search**: Multi-field search dengan LIKE queries
- **Sorting Options**: Flexible sorting dengan customizable order
- **Filter Support**: Status, priority, dan attribute-based filtering

### Data Validation
- **Input Validation**: Comprehensive validation dengan express-validator
- **Custom Validators**: Domain-specific validation rules
- **Error Formatting**: Consistent error response format
- **Sanitization**: Input cleaning untuk security

### Error Handling
- **Global Error Handler**: Centralized error processing
- **Custom Error Classes**: Structured error types
- **Logging**: Comprehensive error logging
- **User-friendly Messages**: Clear error messages untuk API consumers

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v14 atau lebih baru)
- MySQL (v5.7 atau lebih baru)
- npm atau yarn package manager

### Quick Start
```bash
# 1. Clone atau extract project
# 2. Install dependencies
npm install

# 3. Setup environment variables
cp .env.example .env
# Edit .env dengan konfigurasi database Anda

# 4. Setup database
# Import database/schema.sql ke MySQL
mysql -u root -p isp_management < database/schema.sql

# 5. Seed default data
npm run seed

# 6. Start development server
npm run dev
```

### Environment Configuration
```env
# Server
PORT=3000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=isp_management

# JWT
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRES_IN=24h

# Security
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## 🔧 Development

### Available Scripts
```bash
npm start        # Production server
npm run dev      # Development server dengan nodemon
npm run seed     # Database seeding
npm test         # Run tests (jika ada)
```

### Default Credentials
Setelah seeding database:
- **Email**: admin@ispmanagement.com
- **Password**: admin123456
- **Role**: Admin (full access)

⚠️ **Ubah password default setelah login pertama!**

## 📚 API Documentation

### Testing dengan Postman
Import file `ISP_Management_API.postman_collection.json` ke Postman untuk testing lengkap semua endpoints.

### Response Format
```json
{
  "success": true|false,
  "message": "Description",
  "data": {}, // Response data
  "pagination": {}, // Untuk paginated responses
  "errors": [] // Validation errors
}
```

### Pagination Response
```json
{
  "data": [...],
  "pagination": {
    "current_page": 1,
    "per_page": 10,
    "total": 100,
    "total_pages": 10,
    "has_next": true,
    "has_prev": false
  }
}
```

## 🎯 Production Considerations

### Performance
- **Connection Pooling**: MySQL connection pool untuk scalability
- **Query Optimization**: Indexed queries dan efficient joins
- **Response Caching**: Implementasi caching strategy untuk data yang tidak sering berubah
- **Rate Limiting**: Protection dari API abuse

### Security
- **Environment Variables**: Sensitive data tidak hardcoded
- **SQL Injection Prevention**: Parameterized queries
- **XSS Protection**: Input sanitization
- **HTTPS Enforcement**: SSL/TLS untuk production
- **Security Headers**: Helmet.js security headers

### Monitoring
- **Logging**: Comprehensive logging dengan Morgan
- **Error Tracking**: Global error handler
- **Health Checks**: Built-in health check endpoint
- **Metrics**: API usage monitoring

## 🤝 Contributing

Untuk berkontribusi pada project ini:

1. Fork repository
2. Buat feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push ke branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

Distributed under the ISC License. See `LICENSE` for more information.

## 👨‍💻 Author

**Oskar Pra Andrea Sussetyo**
- Project Developer
- System Architecture Design
- Full-stack Implementation

---

> **Catatan**: Aplikasi ini dikembangkan sebagai sistem backend API yang dapat diintegrasikan dengan berbagai frontend framework seperti React, Vue.js, atau Angular untuk membuat complete web application.