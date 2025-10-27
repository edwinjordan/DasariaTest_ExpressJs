const database = require('../src/config/database');
const bcrypt = require('bcryptjs');

async function createDefaultAdmin() {
    try {
        console.log('Creating default admin user...');
        
        // Check if admin already exists
        const existingAdmin = await database.query(
            'SELECT id FROM users WHERE email = ?', 
            ['admin@ispmanagement.com']
        );
        
        if (existingAdmin.length > 0) {
            console.log('Admin user already exists!');
            return;
        }
        
        // Hash default password
        const hashedPassword = await bcrypt.hash('admin123456', 10);
        
        // Create admin user
        const adminData = {
            username: 'admin',
            email: 'admin@ispmanagement.com',
            password: hashedPassword,
            full_name: 'System Administrator',
            phone: '+628123456789',
            is_active: true
        };
        
        const result = await database.query(
            'INSERT INTO users (username, email, password, full_name, phone, is_active) VALUES (?, ?, ?, ?, ?, ?)',
            [adminData.username, adminData.email, adminData.password, adminData.full_name, adminData.phone, adminData.is_active]
        );
        
        const adminId = result.insertId;
        
        // Assign Admin role (ID = 1)
        await database.query(
            'INSERT INTO role_user (user_id, role_id) VALUES (?, ?)',
            [adminId, 1]
        );
        
        console.log('✅ Default admin user created successfully!');
        console.log('📧 Email: admin@ispmanagement.com');
        console.log('🔑 Password: admin123456');
        console.log('⚠️  Please change the password after first login!');
        
    } catch (error) {
        console.error('❌ Error creating admin user:', error.message);
    }
}

async function createSampleData() {
    try {
        console.log('Creating sample data...');
        
        // Create sample customers
        const customers = [
            {
                customer_code: 'CUST25010001',
                full_name: 'John Doe',
                email: 'john.doe@email.com',
                phone: '+628123456701',
                address: 'Jl. Merdeka No. 123, Jakarta Pusat',
                id_number: '3171012345678901'
            },
            {
                customer_code: 'CUST25010002',
                full_name: 'Jane Smith',
                email: 'jane.smith@email.com',
                phone: '+628123456702',
                address: 'Jl. Sudirman No. 456, Jakarta Selatan',
                id_number: '3171012345678902'
            },
            {
                customer_code: 'CUST25010003',
                full_name: 'Bob Johnson',
                email: 'bob.johnson@email.com',
                phone: '+628123456703',
                address: 'Jl. Thamrin No. 789, Jakarta Pusat',
                id_number: '3171012345678903'
            }
        ];
        
        for (const customer of customers) {
            // Check if customer exists
            const existing = await database.query(
                'SELECT id FROM customers WHERE customer_code = ?',
                [customer.customer_code]
            );
            
            if (existing.length === 0) {
                await database.query(
                    'INSERT INTO customers (customer_code, full_name, email, phone, address, id_number) VALUES (?, ?, ?, ?, ?, ?)',
                    [customer.customer_code, customer.full_name, customer.email, customer.phone, customer.address, customer.id_number]
                );
                console.log(`✅ Customer ${customer.full_name} created`);
            }
        }
        
        // Create sample subscriptions
        const subscriptions = [
            {
                subscription_code: 'SUB25010001',
                customer_id: 1, // Assuming first customer gets ID 1
                service_package_id: 2, // Standard Package
                installation_address: 'Jl. Merdeka No. 123, Jakarta Pusat',
                installation_date: '2025-01-15',
                status: 'active',
                monthly_fee: 499000
            },
            {
                subscription_code: 'SUB25010002',
                customer_id: 2,
                service_package_id: 3, // Premium Package
                installation_address: 'Jl. Sudirman No. 456, Jakarta Selatan',
                installation_date: '2025-01-20',
                status: 'active',
                monthly_fee: 799000
            }
        ];
        
        for (const subscription of subscriptions) {
            const existing = await database.query(
                'SELECT id FROM subscriptions WHERE subscription_code = ?',
                [subscription.subscription_code]
            );
            
            if (existing.length === 0) {
                await database.query(
                    'INSERT INTO subscriptions (subscription_code, customer_id, service_package_id, installation_address, installation_date, status, monthly_fee) VALUES (?, ?, ?, ?, ?, ?, ?)',
                    [subscription.subscription_code, subscription.customer_id, subscription.service_package_id, subscription.installation_address, subscription.installation_date, subscription.status, subscription.monthly_fee]
                );
                console.log(`✅ Subscription ${subscription.subscription_code} created`);
            }
        }
        
        console.log('✅ Sample data created successfully!');
        
    } catch (error) {
        console.error('❌ Error creating sample data:', error.message);
    }
}

async function main() {
    console.log('🚀 Starting database seeding...\n');
    
    try {
        await createDefaultAdmin();
        console.log('');
        await createSampleData();
        console.log('\n✅ Database seeding completed successfully!');
        console.log('\n🎯 You can now start the application with: npm start');
        
    } catch (error) {
        console.error('❌ Seeding failed:', error.message);
    } finally {
        await database.close();
        process.exit(0);
    }
}

// Run if called directly
if (require.main === module) {
    main();
}

module.exports = { createDefaultAdmin, createSampleData };