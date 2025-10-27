# ISP Management System API Documentation

## Base URL
```
http://localhost:3000/api
```

## Authentication
All protected endpoints require JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Endpoints

### Authentication
- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `POST /auth/logout` - User logout

### Users Management
- `GET /users` - Get all users (Admin only)
- `GET /users/:id` - Get user by ID
- `POST /users` - Create new user (Admin only)
- `PUT /users/:id` - Update user
- `DELETE /users/:id` - Delete user (Admin only)

### Customers Management
- `GET /customers` - Get all customers
- `GET /customers/:id` - Get customer by ID
- `POST /customers` - Create new customer
- `PUT /customers/:id` - Update customer
- `DELETE /customers/:id` - Delete customer

### Service Packages Management 🆕
- `GET /service-packages` - Get all service packages
  - Query params: `page`, `limit`, `status`, `type`
- `GET /service-packages/:id` - Get service package by ID
- `POST /service-packages` - Create new service package (Admin/Staff only)
- `PUT /service-packages/:id` - Update service package (Admin/Staff only)
- `DELETE /service-packages/:id` - Delete service package (Admin only)
- `PUT /service-packages/:id/activate` - Activate service package (Admin/Staff only)
- `PUT /service-packages/:id/deactivate` - Deactivate service package (Admin/Staff only)

### Subscriptions Management 🆕
- `GET /subscriptions` - Get all subscriptions
  - Query params: `page`, `limit`, `status`, `customer_id`, `package_id`
- `GET /subscriptions/:id` - Get subscription by ID
- `POST /subscriptions` - Create new subscription
- `PUT /subscriptions/:id` - Update subscription
- `DELETE /subscriptions/:id` - Delete subscription (Admin only)
- `PUT /subscriptions/:id/activate` - Activate subscription
- `PUT /subscriptions/:id/suspend` - Suspend subscription
- `PUT /subscriptions/:id/cancel` - Cancel subscription
- `PUT /subscriptions/:id/renew` - Renew subscription

### Tickets Management
- `GET /tickets` - Get all tickets
- `GET /tickets/:id` - Get ticket by ID
- `POST /tickets` - Create new ticket
- `PUT /tickets/:id` - Update ticket
- `DELETE /tickets/:id` - Delete ticket

### System
- `GET /health` - Health check
- `GET /docs` - API documentation

## Service Package Request/Response Examples

### Create Service Package
```json
POST /api/service-packages
{
  "name": "Premium Internet 100Mbps",
  "description": "High-speed internet package with 100Mbps download speed",
  "type": "internet",
  "speed_download": 100,
  "speed_upload": 50,
  "data_limit": null,
  "price": 299000,
  "billing_cycle": "monthly",
  "features": ["Unlimited data", "24/7 support", "Free installation"]
}
```

### Service Package Response
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Premium Internet 100Mbps",
    "description": "High-speed internet package with 100Mbps download speed",
    "type": "internet",
    "speed_download": 100,
    "speed_upload": 50,
    "data_limit": null,
    "price": 299000,
    "billing_cycle": "monthly",
    "features": ["Unlimited data", "24/7 support", "Free installation"],
    "status": "active",
    "created_at": "2024-01-15T10:30:00.000Z",
    "updated_at": "2024-01-15T10:30:00.000Z"
  }
}
```

## Subscription Request/Response Examples

### Create Subscription
```json
POST /api/subscriptions
{
  "customer_id": 1,
  "service_package_id": 1,
  "start_date": "2024-01-15",
  "billing_address": "Jl. Sudirman No. 123, Jakarta",
  "installation_address": "Jl. Sudirman No. 123, Jakarta"
}
```

### Subscription Response
```json
{
  "success": true,
  "data": {
    "id": 1,
    "customer_id": 1,
    "service_package_id": 1,
    "status": "active",
    "start_date": "2024-01-15T00:00:00.000Z",
    "end_date": "2024-02-15T00:00:00.000Z",
    "next_billing_date": "2024-02-15T00:00:00.000Z",
    "billing_address": "Jl. Sudirman No. 123, Jakarta",
    "installation_address": "Jl. Sudirman No. 123, Jakarta",
    "created_at": "2024-01-15T10:30:00.000Z",
    "updated_at": "2024-01-15T10:30:00.000Z",
    "customer": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com"
    },
    "service_package": {
      "id": 1,
      "name": "Premium Internet 100Mbps",
      "price": 299000,
      "billing_cycle": "monthly"
    }
  }
}
```

## Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `422` - Validation Error
- `500` - Internal Server Error

## Error Response Format
```json
{
  "success": false,
  "message": "Error description",
  "errors": {
    "field_name": ["Validation error message"]
  }
}
```

## Pagination Response Format
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "totalPages": 5,
    "hasNext": true,
    "hasPrev": false
  }
}
```

## Role-Based Access Control (RBAC)

### User Roles
- **Admin**: Full access to all endpoints
- **Staff**: Limited access (cannot delete users/packages)
- **Customer**: Read-only access to own data

### Permission Matrix
| Endpoint | Admin | Staff | Customer |
|----------|--------|--------|-----------|
| Users CRUD | ✅ | ❌ (Read only) | ❌ |
| Customers CRUD | ✅ | ✅ | ❌ (Own data) |
| Service Packages CRUD | ✅ | ✅ (No delete) | ❌ (Read only) |
| Subscriptions CRUD | ✅ | ✅ | ✅ (Own subs) |
| Tickets CRUD | ✅ | ✅ | ✅ (Own tickets) |