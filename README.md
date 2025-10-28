# ISP Management System API

Sistem manajemen ISP yang dikembangkan menggunakan Express.js dengan database MySQL dan struktur folder yang modular.

## Fitur

### 1. Manajemen Pengguna dan Hak Akses
- **Users**: Menyimpan data pengguna (Admin, Agent NOC, Customer Service)
- **Roles**: Mendefinisikan peran dalam sistem
- **Permissions**: Berisi daftar hak akses yang tersedia
- **Relasi Many-to-Many**: User-Role dan Role-Permission

### 2. Manajemen Pelanggan dan Layanan
- **Customers**: Data pelanggan lengkap
- **Service Packages**: Paket layanan internet
- **Subscriptions**: Menghubungkan pelanggan dengan paket layanan

### 3. Manajemen Tiket Gangguan
- **Tickets**: Laporan gangguan dari pelanggan
- **Ticket Categories**: Kategorisasi jenis gangguan
- **Ticket Status Histories**: Audit trail perubahan status tiket

### 4. Arsitektur Aplikasi
- **Routes**: Memetakan URL ke Controller
- **Middleware**: Autentikasi dan otorisasi
- **Controllers**: Orkestrator logika bisnis
- **Repositories**: Abstraksi akses data
- **Models**: Representasi tabel database

## Instalasi

1. Clone repository atau extract project
2. Install dependencies:
   ```bash
   npm install
   ```

3. Setup database MySQL:
   - Buat database dengan nama `isp_management`
   - Import schema dari file `database/schema.sql`

4. Konfigurasi environment:
   - Copy file `.env` dan sesuaikan konfigurasi database
   - Ubah `JWT_SECRET` dengan secret key yang aman

5. Jalankan aplikasi:
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

## API Documentation

### 📖 Interactive Swagger Documentation

Aplikasi ini dilengkapi dengan **Swagger/OpenAPI 3.0** untuk dokumentasi API yang interaktif dan lengkap.

**Akses Swagger UI**: http://localhost:3000/api-docs

#### Fitur Swagger:
- ✅ **Interactive Testing** - Test semua endpoint langsung dari browser
- ✅ **Authentication** - Login dan authorize dengan JWT token
- ✅ **Request/Response Schemas** - Lihat struktur data lengkap
- ✅ **80+ Documented Endpoints** - Semua endpoint terdokumentasi
- ✅ **Try It Out** - Execute requests dan lihat real responses

#### Cara Menggunakan:
1. Buka http://localhost:3000/api-docs
2. Login melalui endpoint `POST /auth/login`
3. Copy token dari response
4. Klik tombol "Authorize" di Swagger UI
5. Paste token dengan format: `Bearer YOUR_TOKEN_HERE`
6. Sekarang Anda bisa test semua protected endpoints!

**Detail lengkap**: Lihat [SWAGGER_IMPLEMENTATION.md](./SWAGGER_IMPLEMENTATION.md)

---

### 📚 Static API Documentation

Akses dokumentasi statis di: http://localhost:3000/api/docs

### Authentication

Gunakan JWT Bearer token untuk mengakses protected routes:
```
Authorization: Bearer <your-jwt-token>
```

### Default Users

Setelah menjalankan schema SQL, gunakan credentials berikut untuk testing:

```javascript
// Administrator (Full Access)
{
  "email": "admin@example.com",
  "password": "admin123"
}

// Support Staff
{
  "email": "staff@example.com", 
  "password": "staff123"
}

// Manager
{
  "email": "manager@example.com",
  "password": "manager123"
}
```

### Endpoints Utama

#### Authentication
- `POST /api/auth/login` - Login user
- `POST /api/auth/register` - Registrasi user baru
- `GET /api/auth/me` - Profile user saat ini
- `POST /api/auth/change-password` - Ubah password

#### User Management (Admin Only)
- `GET /api/users` - List semua user
- `POST /api/users` - Buat user baru
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Hapus user
- `POST /api/users/:id/assign-role` - Assign role ke user

#### Customer Management
- `GET /api/customers` - List semua customer
- `POST /api/customers` - Buat customer baru
- `PUT /api/customers/:id` - Update customer
- `GET /api/customers/stats` - Statistik customer

#### Ticket Management
- `GET /api/tickets` - List semua tiket
- `POST /api/tickets` - Buat tiket baru
- `PUT /api/tickets/:id` - Update tiket
- `POST /api/tickets/:id/status` - Update status tiket
- `POST /api/tickets/:id/assign` - Assign tiket ke user
- `GET /api/tickets/my` - Tiket yang di-assign ke user saat ini

## Struktur Folder

```
src/
├── config/          # Konfigurasi aplikasi
│   └── database.js  # Koneksi database
├── controllers/     # Controllers
├── middleware/      # Custom middleware
├── models/         # Database models
├── repositories/   # Repository pattern
├── routes/         # API routes
└── app.js          # Main application file

database/
└── schema.sql      # Database schema

docs/               # Dokumentasi
```

## Permission System

### Roles
- **Admin**: Full system access
- **Agent NOC**: Network operations, ticket management
- **Customer Service**: Customer & ticket management

### Permissions
- `users.*` - User management
- `customers.*` - Customer management
- `tickets.*` - Ticket management
- `subscriptions.*` - Subscription management

## Environment Variables

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=isp_management

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=24h

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## Security Features

- JWT Authentication
- Role-based Access Control (RBAC)
- Permission-based Authorization
- Password hashing dengan bcrypt
- Rate limiting
- Input validation
- Security headers dengan Helmet
- CORS protection

## Development

### Prerequisites
- Node.js (v14 atau lebih baru)
- MySQL (v5.7 atau lebih baru)
- npm atau yarn

### Development Commands
```bash
# Install dependencies
npm install

# Run in development mode (dengan nodemon)
npm run dev

# Run in production mode
npm start

# Run tests (jika ada)
npm test
```

### Database Schema

Database schema tersedia di `database/schema.sql` dengan fitur:
- User management dengan roles & permissions
- Customer management
- Service packages & subscriptions
- Ticket management dengan status history
- Proper indexing untuk performance
- Foreign key constraints
- Default data untuk roles, permissions, dan categories

## Author

**Edwin Yordan Laksono**

## License

ISC License