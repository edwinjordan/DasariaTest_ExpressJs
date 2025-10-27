# ISP Management System - Architecture Documentation

## 📐 System Architecture Overview

```mermaid
graph TB
    subgraph "Client Layer"
        Client[Client Applications]
        Postman[Postman/API Testing]
    end

    subgraph "API Gateway Layer"
        Express[Express.js Server<br/>Port 3000]
    end

    subgraph "Middleware Layer"
        Auth[Authentication<br/>JWT Verification]
        AuthZ[Authorization<br/>Permission Check]
        Validate[Validation<br/>Input Validation]
        RateLimit[Rate Limiting<br/>Security]
        ErrorHandler[Error Handler<br/>Global Handling]
    end

    subgraph "Application Layer"
        subgraph "Controllers"
            AuthCtrl[AuthController]
            UserCtrl[UserController]
            CustomerCtrl[CustomerController]
            TicketCtrl[TicketController]
            SubCtrl[SubscriptionController]
            PkgCtrl[ServicePackageController]
            RoleCtrl[RoleController]
            PermCtrl[PermissionController]
            CatCtrl[TicketCategoryController]
        end

        subgraph "Repositories"
            UserRepo[UserRepository]
            CustomerRepo[CustomerRepository]
            TicketRepo[TicketRepository]
            SubRepo[SubscriptionRepository]
            PkgRepo[ServicePackageRepository]
            RoleRepo[RoleRepository]
            PermRepo[PermissionRepository]
            CatRepo[TicketCategoryRepository]
        end

        subgraph "Models"
            UserModel[User Model]
            CustomerModel[Customer Model]
            TicketModel[Ticket Model]
            SubModel[Subscription Model]
            PkgModel[ServicePackage Model]
            RoleModel[Role Model]
            PermModel[Permission Model]
            CatModel[TicketCategory Model]
            BaseModel[BaseModel<br/>Abstract Class]
        end
    end

    subgraph "Data Layer"
        MySQL[(MySQL Database<br/>isp_management)]
    end

    Client --> Express
    Postman --> Express
    Express --> Auth
    Auth --> AuthZ
    AuthZ --> Validate
    Validate --> Controllers
    
    Controllers --> ErrorHandler
    
    AuthCtrl --> UserRepo
    UserCtrl --> UserRepo
    CustomerCtrl --> CustomerRepo
    TicketCtrl --> TicketRepo
    SubCtrl --> SubRepo
    PkgCtrl --> PkgRepo
    RoleCtrl --> RoleRepo
    PermCtrl --> PermRepo
    CatCtrl --> CatRepo
    
    UserRepo --> UserModel
    CustomerRepo --> CustomerModel
    TicketRepo --> TicketModel
    SubRepo --> SubModel
    PkgRepo --> PkgModel
    RoleRepo --> RoleModel
    PermRepo --> PermModel
    CatRepo --> CatModel
    
    UserModel --> BaseModel
    CustomerModel --> BaseModel
    TicketModel --> BaseModel
    SubModel --> BaseModel
    PkgModel --> BaseModel
    RoleModel --> BaseModel
    PermModel --> BaseModel
    CatModel --> BaseModel
    
    BaseModel --> MySQL
    
    Express --> RateLimit
    RateLimit --> Auth

    style Express fill:#4CAF50,stroke:#333,stroke-width:4px,color:#fff
    style MySQL fill:#00758F,stroke:#333,stroke-width:4px,color:#fff
    style Auth fill:#FF9800,stroke:#333,stroke-width:2px
    style AuthZ fill:#FF9800,stroke:#333,stroke-width:2px
    style BaseModel fill:#9C27B0,stroke:#333,stroke-width:2px,color:#fff
```

## 🏗️ Layered Architecture

```mermaid
graph LR
    subgraph "Presentation Layer"
        Routes[Routes/Endpoints]
    end
    
    subgraph "Business Logic Layer"
        Controllers[Controllers<br/>Business Logic]
        Middleware[Middleware<br/>Auth, Validation, etc]
    end
    
    subgraph "Data Access Layer"
        Repositories[Repositories<br/>Data Operations]
        Models[Models<br/>Data Structure]
    end
    
    subgraph "Database Layer"
        DB[(MySQL Database)]
    end
    
    Routes --> Middleware
    Middleware --> Controllers
    Controllers --> Repositories
    Repositories --> Models
    Models --> DB
    
    style Routes fill:#2196F3,color:#fff
    style Controllers fill:#4CAF50,color:#fff
    style Repositories fill:#FF9800,color:#fff
    style Models fill:#9C27B0,color:#fff
    style DB fill:#00758F,color:#fff
```

## 🔐 Authentication & Authorization Flow

```mermaid
sequenceDiagram
    participant Client
    participant Express
    participant AuthMiddleware
    participant AuthController
    participant UserRepository
    participant Database
    participant JWTService

    Client->>Express: POST /api/auth/login
    Express->>AuthController: login(email, password)
    AuthController->>UserRepository: findUserByEmail(email)
    UserRepository->>Database: SELECT * FROM users WHERE email = ?
    Database-->>UserRepository: User Data
    UserRepository-->>AuthController: User Object
    AuthController->>AuthController: bcrypt.compare(password, hashedPassword)
    AuthController->>JWTService: generateToken(userId, roles)
    JWTService-->>AuthController: JWT Token
    AuthController-->>Client: {success: true, token, user}
    
    Note over Client,Database: Subsequent Authenticated Request
    
    Client->>Express: GET /api/customers (with JWT)
    Express->>AuthMiddleware: authenticate()
    AuthMiddleware->>AuthMiddleware: verifyToken()
    AuthMiddleware->>Express: attach user to req
    Express->>Express: authorize(['customers.view'])
    Express->>Express: checkPermissions()
    Express->>Express: CustomerController.index()
    Express-->>Client: Customer Data
```

## 📊 Database Schema Relationships

```mermaid
erDiagram
    users ||--o{ role_user : has
    roles ||--o{ role_user : assigned_to
    roles ||--o{ permission_role : has
    permissions ||--o{ permission_role : assigned_to
    
    users ||--o{ customers : creates
    customers ||--o{ subscriptions : has
    service_packages ||--o{ subscriptions : used_in
    
    customers ||--o{ tickets : creates
    users ||--o{ tickets : assigned_to
    ticket_categories ||--o{ tickets : categorizes
    tickets ||--o{ ticket_user : assigned
    users ||--o{ ticket_user : handles
    tickets ||--o{ ticket_status_histories : has
    
    users {
        int id PK
        string username UK
        string email UK
        string password
        string full_name
        string phone
        boolean is_active
        timestamp created_at
    }
    
    roles {
        int id PK
        string name UK
        string description
        timestamp created_at
    }
    
    permissions {
        int id PK
        string name UK
        string resource
        string action
        string description
    }
    
    role_user {
        int user_id FK
        int role_id FK
    }
    
    permission_role {
        int permission_id FK
        int role_id FK
    }
    
    customers {
        int id PK
        string customer_code UK
        string full_name
        string email UK
        string phone
        string address
        string id_number
        int created_by FK
        timestamp created_at
    }
    
    service_packages {
        int id PK
        string name
        string type
        int speed_download
        int speed_upload
        decimal price
        string billing_cycle
        boolean is_active
    }
    
    subscriptions {
        int id PK
        string subscription_code UK
        int customer_id FK
        int service_package_id FK
        date start_date
        date end_date
        string status
        decimal monthly_fee
    }
    
    ticket_categories {
        int id PK
        string name UK
        string description
        int priority_level
        int response_time_hours
    }
    
    tickets {
        int id PK
        string ticket_number UK
        int customer_id FK
        int subscription_id FK
        int category_id FK
        string title
        text description
        string priority
        string status
        int assigned_to FK
    }
    
    ticket_user {
        int ticket_id FK
        int user_id FK
    }
    
    ticket_status_histories {
        int id PK
        int ticket_id FK
        string old_status
        string new_status
        int changed_by FK
        timestamp changed_at
    }
```

## 🔄 Request/Response Flow

```mermaid
sequenceDiagram
    participant Client
    participant Routes
    participant Middleware
    participant Controller
    participant Repository
    participant Model
    participant Database

    Client->>Routes: HTTP Request
    Routes->>Middleware: authMiddleware
    Middleware->>Middleware: Verify JWT Token
    Middleware->>Routes: Attach user to request
    Routes->>Middleware: validate
    Middleware->>Middleware: Check input validation
    Middleware->>Routes: Validation passed
    Routes->>Middleware: authorize
    Middleware->>Middleware: Check permissions
    Middleware->>Routes: Authorization passed
    Routes->>Controller: Execute controller method
    Controller->>Repository: Call repository method
    Repository->>Model: Use model method
    Model->>Database: Execute SQL query
    Database-->>Model: Return data
    Model-->>Repository: Return result
    Repository-->>Controller: Return processed data
    Controller-->>Routes: Return response
    Routes-->>Client: JSON Response
```

## 📁 Directory Structure

```
ISP Management System
│
├── src/
│   ├── app.js                      # Application entry point
│   ├── config/
│   │   └── database.js            # MySQL connection configuration
│   │
│   ├── middleware/
│   │   ├── auth.js                # JWT authentication middleware
│   │   ├── authorize.js           # Permission-based authorization
│   │   ├── validate.js            # Input validation middleware
│   │   ├── validation.js          # Validation helpers
│   │   └── errorHandler.js        # Global error handler
│   │
│   ├── routes/
│   │   ├── index.js               # Main router
│   │   ├── auth.js                # Authentication routes
│   │   ├── users.js               # User management routes
│   │   ├── customers.js           # Customer routes
│   │   ├── tickets.js             # Ticket routes
│   │   ├── ticketCategories.js    # Ticket category routes
│   │   ├── subscriptions.js       # Subscription routes
│   │   ├── servicePackages.js     # Service package routes
│   │   ├── roles.js               # Role management routes
│   │   └── permissions.js         # Permission management routes
│   │
│   ├── controllers/
│   │   ├── AuthController.js
│   │   ├── UserController.js
│   │   ├── CustomerController.js
│   │   ├── TicketController.js
│   │   ├── TicketCategoryController.js
│   │   ├── SubscriptionController.js
│   │   ├── ServicePackageController.js
│   │   ├── RoleController.js
│   │   └── PermissionController.js
│   │
│   ├── repositories/
│   │   ├── BaseRepository.js      # Abstract repository
│   │   ├── UserRepository.js
│   │   ├── CustomerRepository.js
│   │   ├── TicketRepository.js
│   │   ├── TicketCategoryRepository.js
│   │   ├── SubscriptionRepository.js
│   │   ├── ServicePackageRepository.js
│   │   ├── RoleRepository.js
│   │   └── PermissionRepository.js
│   │
│   └── models/
│       ├── BaseModel.js           # Abstract model with DB operations
│       ├── User.js
│       ├── Customer.js
│       ├── Ticket.js
│       ├── TicketCategory.js
│       ├── Subscription.js
│       ├── ServicePackage.js
│       ├── Role.js
│       └── Permission.js
│
├── database/
│   ├── schema.sql                 # Database schema
│   ├── seed.js                    # Database seeder
│   └── README.md
│
├── docs/
│   └── ARCHITECTURE.md            # This file
│
├── .env                           # Environment variables
├── package.json
└── README.md
```

## 🔧 Technology Stack

```mermaid
graph TD
    subgraph "Backend Framework"
        Express[Express.js 4.18.2]
    end
    
    subgraph "Database"
        MySQL[MySQL]
        MySQL2[MySQL2 3.6.3<br/>Node.js Driver]
    end
    
    subgraph "Authentication & Security"
        JWT[jsonwebtoken<br/>JWT Auth]
        Bcrypt[bcryptjs<br/>Password Hashing]
        Helmet[helmet<br/>Security Headers]
        RateLimit[express-rate-limit<br/>Rate Limiting]
        CORS[cors<br/>Cross-Origin]
    end
    
    subgraph "Validation"
        ExpressValidator[express-validator<br/>Input Validation]
    end
    
    subgraph "Development Tools"
        Nodemon[nodemon<br/>Auto-restart]
        Dotenv[dotenv<br/>Environment Config]
    end
    
    Express --> MySQL2
    Express --> JWT
    Express --> Bcrypt
    Express --> Helmet
    Express --> RateLimit
    Express --> CORS
    Express --> ExpressValidator
    MySQL2 --> MySQL
    
    style Express fill:#4CAF50,color:#fff
    style MySQL fill:#00758F,color:#fff
    style JWT fill:#FF9800,color:#fff
```

## 🎯 Design Patterns Used

### 1. **Repository Pattern**
- Abstraction layer between business logic and data access
- `BaseRepository` provides common CRUD operations
- Specific repositories extend BaseRepository for custom queries

### 2. **MVC (Model-View-Controller)**
- **Model**: Data structure and database operations
- **View**: JSON responses (REST API)
- **Controller**: Business logic and request handling

### 3. **Middleware Pattern**
- Chain of responsibility for request processing
- Authentication → Authorization → Validation → Controller

### 4. **Factory Pattern**
- BaseModel factory for creating model instances
- Singleton database connection

### 5. **Dependency Injection**
- Controllers depend on repositories
- Repositories depend on models
- Models depend on database connection

## 🔒 Security Features

```mermaid
graph LR
    subgraph "Security Layers"
        A[Rate Limiting]
        B[Helmet Headers]
        C[CORS Policy]
        D[JWT Authentication]
        E[Permission Authorization]
        F[Input Validation]
        G[SQL Injection Prevention]
        H[Password Hashing]
    end
    
    Request[Client Request] --> A
    A --> B
    B --> C
    C --> D
    D --> E
    E --> F
    F --> G
    G --> H
    H --> Response[Secure Response]
    
    style Request fill:#2196F3,color:#fff
    style Response fill:#4CAF50,color:#fff
```

### Security Implementations:

1. **JWT Authentication**: Stateless token-based authentication
2. **bcryptjs**: Password hashing with salt rounds
3. **Helmet**: Security HTTP headers
4. **Rate Limiting**: Prevent brute force attacks
5. **CORS**: Cross-origin resource sharing control
6. **Input Validation**: express-validator for request validation
7. **SQL Injection Prevention**: Parameterized queries
8. **Role-Based Access Control (RBAC)**: Permission-based authorization

## 📈 Scalability Considerations

1. **Stateless Architecture**: JWT allows horizontal scaling
2. **Repository Pattern**: Easy to switch to different data sources
3. **Modular Structure**: Easy to add new modules
4. **Database Connection Pooling**: Efficient connection management
5. **Error Handling**: Centralized error handling for consistency

## 🚀 API Endpoints Summary

| Module | Endpoints | Permissions Required |
|--------|-----------|---------------------|
| **Authentication** | 4 endpoints | Public/Authenticated |
| **Users** | 9 endpoints | users.* permissions |
| **Customers** | 7 endpoints | customers.* permissions |
| **Tickets** | 11 endpoints | tickets.* permissions |
| **Ticket Categories** | 6 endpoints | ticket_categories.* permissions |
| **Subscriptions** | 12 endpoints | subscriptions.* permissions |
| **Service Packages** | 8 endpoints | service_packages.* permissions |
| **Roles** | 9 endpoints | roles.* permissions (Admin) |
| **Permissions** | 9 endpoints | permissions.* permissions (Admin) |

**Total**: 75+ API Endpoints

## 📊 Data Flow Example: Create Ticket

```mermaid
sequenceDiagram
    participant C as Client
    participant R as Routes
    participant M as Middleware
    participant TC as TicketController
    participant TR as TicketRepository
    participant TM as TicketModel
    participant DB as Database

    C->>R: POST /api/tickets
    R->>M: authMiddleware
    M->>M: Verify JWT
    M-->>R: User authenticated
    R->>M: validateCreate
    M->>M: Check input fields
    M-->>R: Validation passed
    R->>M: authorize(['tickets.create'])
    M->>M: Check user permissions
    M-->>R: Authorization granted
    R->>TC: create(req, res, next)
    TC->>TR: create(ticketData)
    TR->>TM: create(ticketData)
    TM->>DB: INSERT INTO tickets...
    DB-->>TM: insertId
    TM->>DB: INSERT INTO ticket_status_histories...
    DB-->>TM: success
    TM-->>TR: ticket object
    TR-->>TC: ticket object
    TC-->>C: {success: true, data: ticket}
```

---

## 📝 Notes

- All timestamps are in UTC
- Database uses InnoDB engine for transaction support
- Foreign key constraints ensure referential integrity
- Soft deletes not implemented (hard deletes used)
- Pagination implemented for all list endpoints
- Search functionality available in major modules

---

**Version**: 1.0.0  
**Last Updated**: October 28, 2025  
**Author**: ISP Management System Team
