const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');

const app = express();

// --- MIDDLEWARE ---
app.use(cors()); 
app.use(bodyParser.json({ limit: '10mb' })); 
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// --- STATIC FILE SERVING (for HTML, CSS, JS, images, etc) ---
app.use(express.static(path.join(__dirname))); // Serve files from current directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // Serve uploaded files

// --- 1. KONFIGURASI DATABASE (gunakan pool untuk stabilitas koneksi) ---
// Use environment variables so the app can run in Docker / hosted environments.
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || '';
const DB_NAME = process.env.DB_NAME || 'tukang_db';

const db = mysql.createPool({
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Test connection on startup
db.getConnection((err, connection) => {
    if (err) {
        console.error('❌ Error DB (getConnection):', err.message);
    } else {
        console.log('✅ Connected to DB (pool): tukang_db');
        
        // --- Ensure pesanan table has status column ---
        const addStatusColumnSql = `ALTER TABLE pesanan ADD COLUMN status VARCHAR(50) DEFAULT 'pending'`;
        db.query(addStatusColumnSql, (err) => {
            if (err) {
                if (err.code === 'ER_DUP_FIELDNAME') {
                    console.log('✅ Column "status" already exists in pesanan table');
                } else {
                    console.warn('⚠️ Could not add status column:', err.message);
                }
            } else {
                console.log('✅ Added "status" column to pesanan table');
            }
        });
        
        // --- Create payment_records table if not exists ---
        const createPaymentRecordsSql = `
            CREATE TABLE IF NOT EXISTS payment_records (
                id INT PRIMARY KEY AUTO_INCREMENT,
                pesanan_id INT NOT NULL,
                payment_method VARCHAR(50),
                payment_amount INT,
                payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                payment_proof VARCHAR(255),
                status VARCHAR(50) DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (pesanan_id) REFERENCES pesanan(id)
            );
        `;
        db.query(createPaymentRecordsSql, (err) => {
            if (err) {
                console.warn('⚠️ Could not create payment_records table:', err.message);
            } else {
                console.log('✅ Ensured payment_records table exists');
            }
        });

        // --- Create qris_settings table if not exists ---
        const createQrisSettingsSql = `
            CREATE TABLE IF NOT EXISTS qris_settings (
                id INT PRIMARY KEY AUTO_INCREMENT,
                qris_image_path VARCHAR(255),
                merchant_name VARCHAR(255),
                merchant_id VARCHAR(100),
                merchant_phone VARCHAR(20),
                is_active BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            );
        `;
        db.query(createQrisSettingsSql, (err) => {
            if (err) {
                console.warn('⚠️ Could not create qris_settings table:', err.message);
            } else {
                console.log('✅ Ensured qris_settings table exists');
                
                // Insert default QRIS settings if not exists
                const insertQrisSettingsSql = `
                    INSERT INTO qris_settings (merchant_name, merchant_phone, qris_image_path) 
                    SELECT 'HandyMan Payment', '+62 821 8888 8888', 'qris-code.png' 
                    WHERE NOT EXISTS (SELECT 1 FROM qris_settings WHERE merchant_name = 'HandyMan Payment')
                `;
                db.query(insertQrisSettingsSql, (err) => {
                    if (!err) {
                        console.log('✅ QRIS settings configured');
                    }
                });
            }
        });
        
        // Add payment columns to pesanan if not exists
        const addPaymentColumnsSql = `
            ALTER TABLE pesanan 
            ADD COLUMN payment_method VARCHAR(50) DEFAULT NULL,
            ADD COLUMN payment_amount INT DEFAULT NULL,
            ADD COLUMN payment_date TIMESTAMP NULL,
            ADD COLUMN payment_proof VARCHAR(255) DEFAULT NULL
        `;
        db.query(addPaymentColumnsSql, (err) => {
            if (err && err.code !== 'ER_DUP_FIELDNAME') {
                console.warn('⚠️ Could not add payment columns:', err.message);
            } else if (!err) {
                console.log('✅ Added payment columns to pesanan table');
            }
        });
        
        connection.release();
    }
});

// --- API AUTH & PESANAN (YG LAMA) ---
app.post('/api/register', (req, res) => {
    // Debug: print incoming body to ensure frontend sends tipe_pengguna
    console.log('\n[DEBUG] /api/register called with body:', req.body);

    const { nama_depan, nama_belakang, email, password, jenis_kelamin, alamat, tipe_pengguna } = req.body;
    const sql = `INSERT INTO users (nama_depan, nama_belakang, email, password, jenis_kelamin, alamat, tipe_pengguna) VALUES (?, ?, ?, ?, ?, ?, ?)`;
    db.query(sql, [nama_depan, nama_belakang, email, password, jenis_kelamin, alamat, tipe_pengguna], (err, result) => {
        if (err) {
            console.error('❌ Error Register:', err.message);
            return res.status(500).json({ success: false, message: err.message });
        }
        res.json({ success: true, message: 'Register Berhasil' });
    });
});

app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    const sql = 'SELECT * FROM users WHERE email = ? AND password = ?';
    db.query(sql, [email, password], (err, result) => {
        if (err) {
            console.error('❌ Error Login:', err.message);
            return res.status(500).json({ success: false, message: err.message });
        }
        if (result.length > 0) res.json({ success: true, user: result[0] });
        else res.status(401).json({ success: false, message: 'Salah email/pass' });
    });
});

app.post('/api/pesanan', (req, res) => {
    // NOTE: This route previously accepted JSON with a `foto` field.
    // We'll keep backward compatibility by rejecting if no file provided.
    const { nama_user, kategori, deskripsi, alamat, foto } = req.body;
    // If client sent `foto` as base64 or filename in JSON, you may handle it here.
    const sql = "INSERT INTO pesanan (nama_user, kategori_jasa, deskripsi_masalah, alamat, `Foto masalah`) VALUES (?, ?, ?, ?, ?)";
    db.query(sql, [nama_user, kategori, deskripsi, alamat, foto || null], (err, result) => {
        if (err) {
            console.error('❌ Error inserting pesanan (JSON route):', err);
            return res.status(500).json({ success: false, message: err.message });
        }
        res.json({ success: true, message: 'Pesanan Terkirim!' });
    });
});

// --- GET semua pesanan untuk ditampilkan di halaman Orderan ---
app.get('/api/pesanan', (req, res) => {
    const sql = "SELECT * FROM pesanan ORDER BY id DESC";
    db.query(sql, (err, results) => {
        if (err) {
            console.error('❌ Error fetching pesanan:', err);
            return res.status(500).json({ success: false, message: err.message });
        }
        res.json({ success: true, data: results });
    });
});

// --- PUT /api/pesanan/:id - Update status pesanan ---
app.put('/api/pesanan/:id', (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!status) {
        return res.status(400).json({ success: false, message: 'Status required' });
    }
    
    // Update status di database
    const sql = "UPDATE pesanan SET status = ? WHERE id = ?";
    db.query(sql, [status, id], (err, result) => {
        if (err) {
            console.error('❌ Error updating pesanan status:', err);
            return res.status(500).json({ success: false, message: err.message });
        }
        
        // Get pesanan details untuk notifikasi
        const getSql = "SELECT nama_user, kategori_jasa FROM pesanan WHERE id = ?";
        db.query(getSql, [id], (err, results) => {
            if (err || !results.length) {
                return res.json({ success: true, message: 'Status updated' });
            }
            
            // Create notification
            const pesanan = results[0];
            const userEmail = 'ALL'; // Send to all admins
            const message = `Pesanan ${pesanan.kategori_jasa} dari ${pesanan.nama_user} - Status: ${status.toUpperCase()}`;
            const notifSql = "INSERT INTO chats (user_email, sender_role, message) VALUES (?, 'system', ?)";
            db.query(notifSql, [userEmail, message], (err) => {
                res.json({ success: true, message: 'Status updated dan notifikasi dikirim', status });
            });
        });
    });
});

// --- NEW: upload foto via multipart/form-data ---
// store files in ./uploads with original name + timestamp to avoid collisions
const storage = multer.diskStorage({
    destination: function (req, file, cb) { cb(null, path.join(__dirname, 'uploads')); },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname);
        const base = path.basename(file.originalname, ext).replace(/[^a-z0-9\-]/gi, '_');
        cb(null, base + '_' + Date.now() + ext);
    }
});
const upload = multer({ storage: storage, limits: { fileSize: 5 * 1024 * 1024 } }); // 5MB limit

// Route: accept form-data with optional file field 'foto'
app.post('/api/pesanan-upload', upload.single('foto'), (req, res) => {
    const { nama_user, kategori, deskripsi, alamat } = req.body;
    let fotoPath = null;
    if (req.file) fotoPath = `uploads/${req.file.filename}`; // relative path to serve if needed

    const sql = "INSERT INTO pesanan (nama_user, kategori_jasa, deskripsi_masalah, alamat, `Foto masalah`) VALUES (?, ?, ?, ?, ?)";
    db.query(sql, [nama_user, kategori, deskripsi, alamat, fotoPath], (err, result) => {
        if (err) {
            console.error('Error inserting pesanan with file:', err.message);
            return res.status(500).json({ success: false, message: err.message });
        }
        res.json({ success: true, message: 'Pesanan terkirim dengan foto', file: fotoPath });
    });
});

// ==========================================
// --- FITUR BARU: CHAT SYSTEM ---
// ==========================================

// 1. Ambil Riwayat Chat (Berdasarkan Email User)
app.get('/api/chats/:email', (req, res) => {
    const userEmail = req.params.email;
    // Ambil pesan milik user ini ATAU pesan admin untuk semua ('ALL')
    const sql = "SELECT * FROM chats WHERE user_email = ? OR user_email = 'ALL' ORDER BY created_at ASC";
    
    db.query(sql, [userEmail], (err, result) => {
        if (err) return res.status(500).json([]);
        res.json(result);
    });
});

// 2. Kirim Chat Baru
app.post('/api/chats', (req, res) => {
    const { user_email, sender_role, message } = req.body;
    const sql = "INSERT INTO chats (user_email, sender_role, message) VALUES (?, ?, ?)";
    
    db.query(sql, [user_email, sender_role, message], (err, result) => {
        if (err) return res.status(500).json({ success: false });
        
        // --- SIMULASI BOT ADMIN MEMBALAS ---
        // (Ini hanya simulasi agar chat terasa hidup)
        if (sender_role === 'user') {
            setTimeout(() => {
                const reply = "Terima kasih! Admin kami sedang mengecek pesan Anda.";
                const sqlBot = "INSERT INTO chats (user_email, sender_role, message) VALUES (?, 'admin', ?)";
                db.query(sqlBot, [user_email, reply]);
            }, 3000); // Admin membalas otomatis setelah 3 detik
        }
        
        res.json({ success: true });
    });

});

// --- PAYMENT ENDPOINTS ---
// Get QRIS Settings
app.get('/api/qris-settings', (req, res) => {
    const sql = "SELECT * FROM qris_settings WHERE is_active = TRUE LIMIT 1";
    db.query(sql, (err, results) => {
        if (err) {
            console.error('❌ Error fetching QRIS settings:', err);
            return res.status(500).json({ success: false, message: err.message });
        }
        if (results.length === 0) {
            return res.status(404).json({ success: false, message: 'QRIS settings not found' });
        }
        res.json({ success: true, data: results[0] });
    });
});

// Record Payment
app.post('/api/payment', (req, res) => {
    const { pesanan_id, payment_method, payment_amount } = req.body;
    
    if (!pesanan_id || !payment_method || !payment_amount) {
        return res.status(400).json({ success: false, message: 'Missing required fields' });
    }
    
    const sql = "INSERT INTO payment_records (pesanan_id, payment_method, payment_amount, status) VALUES (?, ?, ?, 'completed')";
    db.query(sql, [pesanan_id, payment_method, payment_amount], (err, result) => {
        if (err) {
            console.error('❌ Error recording payment:', err);
            return res.status(500).json({ success: false, message: err.message });
        }
        
        // Update pesanan status
        const updateSql = "UPDATE pesanan SET status = 'dibayar', payment_method = ?, payment_amount = ? WHERE id = ?";
        db.query(updateSql, [payment_method, payment_amount, pesanan_id], (err) => {
            if (err) console.error('❌ Error updating pesanan:', err);
            
            res.json({ 
                success: true, 
                message: 'Pembayaran berhasil dicatat',
                payment_id: result.insertId 
            });
        });
    });
});

// Get Payment Records
app.get('/api/payment/:pesanan_id', (req, res) => {
    const { pesanan_id } = req.params;
    const sql = "SELECT * FROM payment_records WHERE pesanan_id = ? ORDER BY payment_date DESC";
    db.query(sql, [pesanan_id], (err, results) => {
        if (err) {
            console.error('❌ Error fetching payment records:', err);
            return res.status(500).json({ success: false, message: err.message });
        }
        res.json({ success: true, data: results });
    });
});

// --- DEBUG: Cek user by email (temporary) ---
app.get('/api/check-user', (req, res) => {
        const email = req.query.email;
        if (!email) return res.status(400).json({ success: false, message: 'email required' });
        const sql = 'SELECT email, tipe_pengguna FROM users WHERE email = ? LIMIT 1';
        db.query(sql, [email], (err, result) => {
            if (err) return res.status(500).json({ success: false, message: err.message });
            if (result.length === 0) return res.status(404).json({ success: false, message: 'Not found' });
            res.json({ success: true, user: result[0] });
        });
    });

const PORT = process.env.PORT || 3000;
// Global error handler to ensure JSON responses on errors (including multer errors)
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    if (res.headersSent) return next(err);
    const message = err && err.message ? err.message : 'Internal Server Error';
    res.status(500).json({ success: false, message });
});

app.listen(PORT, () => {
    console.log(`🚀 Server berjalan di: http://localhost:${PORT}`);
});