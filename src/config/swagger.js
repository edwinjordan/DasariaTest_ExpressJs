const swaggerJsdoc = require('swagger-jsdoc');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'ISP Management System API',
            version: '1.0.0',
            description: `
# ISP Management System API Documentation

Complete REST API for managing Internet Service Provider operations including:
- **User Management** with Role-Based Access Control (RBAC)
- **Customer Management** with full CRUD operations
- **Service Package Management** with pricing and features
- **Subscription Management** with lifecycle control
- **Support Ticket System** with priority and assignment
- **Ticket Categories** for organizing support tickets
- **Ticket Status History** for audit trail
- **Role & Permission Management** for fine-grained access control

## Authentication

This API uses JWT (JSON Web Token) for authentication. Include the token in the Authorization header:

\`\`\`
Authorization: Bearer <your_jwt_token>
\`\`\`

## Getting Started

1. **Login** to get your JWT token using \`POST /api/auth/login\`
2. **Copy the token** from the response
3. **Click "Authorize"** button at the top of this page
4. **Paste the token** (without "Bearer" prefix) and click Authorize
5. **Test endpoints** - all protected endpoints will now work

## Default Users

- **Admin**: admin@ispmanagement.com / admin123456
- **Staff**: staff@ispmanagement.com / staff123456
- **Customer**: customer@ispmanagement.com / customer123456

## Response Format

All API responses follow a consistent structure:

**Success Response:**
\`\`\`json
{
  "success": true,
  "message": "Operation successful",
  "data": {...}
}
\`\`\`

**Error Response:**
\`\`\`json
{
  "success": false,
  "message": "Error description",
  "errors": {
    "field_name": ["Validation error message"]
  }
}
\`\`\`

## Permissions

Access to endpoints is controlled by permissions:
- \`users.*\` - User management operations
- \`customers.*\` - Customer management operations
- \`tickets.*\` - Ticket management operations
- \`ticket_categories.*\` - Category management operations
- \`subscriptions.*\` - Subscription management operations
- \`service_packages.*\` - Package management operations
- \`roles.*\` - Role management operations (Admin only)
- \`permissions.*\` - Permission management operations (Admin only)
            `,
            contact: {
                name: 'API Support',
                email: 'support@ispmanagement.com'
            },
            license: {
                name: 'MIT',
                url: 'https://opensource.org/licenses/MIT'
            }
        },
        servers: [
            {
                url: 'http://localhost:3000/api',
                description: 'Development server'
            },
            {
                url: 'https://api.ispmanagement.com/api',
                description: 'Production server'
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'Enter your JWT token obtained from /auth/login endpoint'
                }
            },
            schemas: {
                Error: {
                    type: 'object',
                    properties: {
                        success: {
                            type: 'boolean',
                            example: false
                        },
                        message: {
                            type: 'string',
                            example: 'Error message'
                        },
                        errors: {
                            type: 'object',
                            additionalProperties: {
                                type: 'array',
                                items: {
                                    type: 'string'
                                }
                            }
                        }
                    }
                },
                SuccessResponse: {
                    type: 'object',
                    properties: {
                        success: {
                            type: 'boolean',
                            example: true
                        },
                        message: {
                            type: 'string',
                            example: 'Operation successful'
                        },
                        data: {
                            type: 'object'
                        }
                    }
                },
                Pagination: {
                    type: 'object',
                    properties: {
                        page: {
                            type: 'integer',
                            example: 1
                        },
                        limit: {
                            type: 'integer',
                            example: 10
                        },
                        total: {
                            type: 'integer',
                            example: 100
                        },
                        totalPages: {
                            type: 'integer',
                            example: 10
                        }
                    }
                }
            },
            responses: {
                UnauthorizedError: {
                    description: 'Access token is missing or invalid',
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/Error'
                            },
                            example: {
                                success: false,
                                message: 'Unauthorized. Please login first'
                            }
                        }
                    }
                },
                ForbiddenError: {
                    description: 'User does not have required permissions',
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/Error'
                            },
                            example: {
                                success: false,
                                message: 'Forbidden. You do not have permission to access this resource'
                            }
                        }
                    }
                },
                NotFoundError: {
                    description: 'Resource not found',
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/Error'
                            },
                            example: {
                                success: false,
                                message: 'Resource not found'
                            }
                        }
                    }
                },
                ValidationError: {
                    description: 'Validation error',
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/Error'
                            },
                            example: {
                                success: false,
                                message: 'Validation failed',
                                errors: {
                                    email: ['Email is required', 'Invalid email format'],
                                    password: ['Password must be at least 8 characters']
                                }
                            }
                        }
                    }
                }
            }
        },
        tags: [
            {
                name: 'Authentication',
                description: 'JWT-based authentication endpoints'
            },
            {
                name: 'Users',
                description: 'User management operations'
            },
            {
                name: 'Customers',
                description: 'Customer management operations'
            },
            {
                name: 'Tickets',
                description: 'Support ticket management'
            },
            {
                name: 'Ticket Categories',
                description: 'Ticket category management'
            },
            {
                name: 'Ticket Status Histories',
                description: 'Ticket status change tracking'
            },
            {
                name: 'Subscriptions',
                description: 'Customer subscription management'
            },
            {
                name: 'Service Packages',
                description: 'Service package management'
            },
            {
                name: 'Roles',
                description: 'Role management for RBAC'
            },
            {
                name: 'Permissions',
                description: 'Permission management for RBAC'
            }
        ]
    },
    apis: ['./src/routes/*.js', './src/controllers/*.js'] // Path to files with annotations
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
