# Swagger API Documentation

## 📖 Overview

Swagger UI telah diintegrasikan ke dalam ISP Management System API untuk memberikan dokumentasi interaktif yang lengkap.

## 🚀 Akses Swagger UI

Setelah server berjalan, akses Swagger UI di:

```
http://localhost:3000/api-docs
```

## 🔐 Cara Menggunakan dengan Authentication

1. **Login terlebih dahulu**
   - Gunakan endpoint `POST /auth/login` di Swagger UI
   - Masukkan credentials (email & password)
   - Copy **JWT token** dari response

2. **Authorize di Swagger UI**
   - Klik tombol **"Authorize"** di pojok kanan atas
   - Paste JWT token (tanpa prefix "Bearer")
   - Klik **"Authorize"**
   - Klik **"Close"**

3. **Test Endpoints**
   - Semua protected endpoints sekarang dapat digunakan
   - Token akan otomatis disertakan di header

## 📝 Default Test Users

```json
{
  "Admin": {
    "email": "admin@ispmanagement.com",
    "password": "admin123456"
  },
  "Staff": {
    "email": "staff@ispmanagement.com",
    "password": "staff123456"
  },
  "Customer": {
    "email": "customer@ispmanagement.com",
    "password": "customer123456"
  }
}
```

## 🎯 Fitur Swagger UI

- ✅ **Try it out**: Test endpoints langsung dari browser
- ✅ **Schema Validation**: Melihat request/response schema
- ✅ **Authorization**: JWT Bearer token authentication
- ✅ **Response Examples**: Contoh response untuk setiap endpoint
- ✅ **Error Handling**: Dokumentasi error codes dan messages
- ✅ **Download OpenAPI Spec**: Export sebagai JSON atau YAML

## 📚 Dokumentasi Tersedia

### Endpoints Terdokumentasi:

1. **Authentication** (`/auth/*`)
   - Login
   - Register
   - Get Profile
   - Change Password

2. **Users** (`/users/*`)
   - Coming soon...

3. **Customers** (`/customers/*`)
   - Coming soon...

4. **Tickets** (`/tickets/*`)
   - Coming soon...

5. **Ticket Categories** (`/ticket-categories/*`)
   - Coming soon...

6. **Ticket Status Histories** (`/ticket-status-histories/*`)
   - Coming soon...

7. **Subscriptions** (`/subscriptions/*`)
   - Coming soon...

8. **Service Packages** (`/service-packages/*`)
   - Coming soon...

9. **Roles** (`/roles/*`)
   - Coming soon...

10. **Permissions** (`/permissions/*`)
    - Coming soon...

## 🔧 Menambahkan Dokumentasi Endpoint Baru

Untuk menambahkan dokumentasi Swagger ke endpoint baru, gunakan JSDoc comments:

```javascript
/**
 * @swagger
 * /api/your-endpoint:
 *   post:
 *     summary: Deskripsi singkat endpoint
 *     tags: [Tag Name]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               field_name:
 *                 type: string
 *                 example: "example value"
 *     responses:
 *       200:
 *         description: Success response
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/your-endpoint', middleware, controller);
```

## 📊 OpenAPI Specification

Swagger menggunakan OpenAPI 3.0.0 specification. File konfigurasi ada di:

```
src/config/swagger.js
```

## 🎨 Customization

Swagger UI dapat dikustomisasi dengan:

- Custom CSS
- Custom Title
- Custom Favicon
- Hide Topbar
- Explorer mode

Konfigurasi ada di `src/app.js`:

```javascript
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'ISP Management API Docs',
    customfavIcon: '/favicon.ico'
}));
```

## 🔄 Auto-Reload

Swagger spec akan di-reload otomatis saat:
- Server restart
- File route diubah (dengan nodemon)
- JSDoc comments ditambahkan/diubah

## 📦 Dependencies

```json
{
  "swagger-ui-express": "^5.0.1",
  "swagger-jsdoc": "^6.2.8"
}
```

## 🌐 Production Deployment

Untuk production, update server URL di `src/config/swagger.js`:

```javascript
servers: [
    {
        url: 'https://your-production-domain.com/api',
        description: 'Production server'
    }
]
```

## 🛠️ Troubleshooting

### Swagger UI tidak muncul
- Pastikan server berjalan
- Cek console untuk error
- Pastikan helmet CSP dikonfigurasi dengan benar

### Authentication tidak working
- Pastikan login dulu dan copy token
- Token harus valid dan tidak expired
- Jangan tambahkan prefix "Bearer" saat paste di Authorize

### Endpoint tidak muncul
- Pastikan JSDoc annotation benar
- Restart server
- Cek path di `swagger.js` apis option

## 📖 Resources

- [Swagger UI Documentation](https://swagger.io/tools/swagger-ui/)
- [OpenAPI 3.0 Specification](https://swagger.io/specification/)
- [swagger-jsdoc Documentation](https://github.com/Surnet/swagger-jsdoc)

---

**Version**: 1.0.0  
**Last Updated**: October 28, 2025
