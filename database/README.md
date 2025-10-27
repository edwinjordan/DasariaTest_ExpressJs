# Database Setup Guide

## Prerequisites
- MySQL Server 5.7 atau lebih baru
- MySQL client (mysql command line atau GUI seperti phpMyAdmin, MySQL Workbench)

## Setup Steps

### 1. Buat Database
```sql
CREATE DATABASE IF NOT EXISTS isp_management;
```

### 2. Import Schema
Jalankan file `schema.sql` untuk membuat tabel dan data default:
```bash
mysql -u root -p isp_management < database/schema.sql
```

Atau copy paste konten `schema.sql` ke MySQL client Anda.

### 3. Konfigurasi Environment
Update file `.env` dengan konfigurasi database Anda:
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=isp_management
```

### 4. Test Koneksi
Jalankan perintah berikut untuk test koneksi database:
```bash
npm run seed
```

Jika berhasil, akan membuat admin user default dan sample data.

### 5. Default Admin User
Setelah seeding, Anda dapat login dengan:
- **Email**: admin@ispmanagement.com
- **Password**: admin123456

⚠️ **PENTING**: Ubah password default setelah login pertama!

## Database Schema Overview

### Users & Permission System
- `users` - Data pengguna sistem
- `roles` - Peran dalam sistem (Admin, Agent NOC, Customer Service)
- `permissions` - Hak akses sistem
- `role_user` - Pivot table user-role (Many-to-Many)
- `permission_role` - Pivot table role-permission (Many-to-Many)

### Customer Management
- `customers` - Data pelanggan
- `service_packages` - Paket layanan internet
- `subscriptions` - Langganan pelanggan

### Ticket System
- `tickets` - Tiket gangguan
- `ticket_categories` - Kategori tiket
- `ticket_status_histories` - History perubahan status tiket
- `ticket_user` - Pivot table ticket-user assignment

## Default Data

### Roles
1. **Admin** - Full system access
2. **Agent NOC** - Network operations & ticket management
3. **Customer Service** - Customer & ticket management

### Permissions
- `users.*` - User management
- `customers.*` - Customer management
- `tickets.*` - Ticket management
- `subscriptions.*` - Subscription management

### Service Packages
1. **Basic Package** - 10 Mbps - Rp 299,000
2. **Standard Package** - 25 Mbps - Rp 499,000
3. **Premium Package** - 50 Mbps - Rp 799,000
4. **Business Package** - 100 Mbps - Rp 1,299,000

### Ticket Categories
1. **Connection Issue** - High priority
2. **Speed Issue** - Medium priority
3. **Hardware Problem** - Medium priority
4. **Billing Inquiry** - Low priority
5. **Installation Request** - Medium priority
6. **Cancellation Request** - Low priority

## Troubleshooting

### Connection Issues
1. Pastikan MySQL server berjalan
2. Cek username/password di file `.env`
3. Pastikan database `isp_management` sudah dibuat
4. Cek firewall tidak memblokir koneksi ke MySQL

### Import Schema Issues
1. Pastikan user MySQL memiliki privilege untuk CREATE dan INSERT
2. Jika ada error foreign key, pastikan menjalankan schema secara berurutan
3. Gunakan MySQL client yang support multiple statements

### Sample Commands
```bash
# Masuk ke MySQL
mysql -u root -p

# Buat database
CREATE DATABASE isp_management;

# Keluar dan import schema
exit
mysql -u root -p isp_management < database/schema.sql

# Test koneksi dari aplikasi
npm run seed
```