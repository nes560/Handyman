const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();

// --- MIDDLEWARE ---
app.use(cors()); 
app.use(bodyParser.json({ limit: '10mb' })); 
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// --- 1. KONFIGURASI DATABASE ---
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'tukang_db'
});

db.connect((err) => {
    if (err) {
        console.error('❌ Error DB:', err.message);
    } else {
        console.log('✅ Connected to DB: tukang_db');
    }
});

// --- API AUTH & PESANAN (YG LAMA) ---
app.post('/api/register', (req, res) => {
    const { nama_depan, nama_belakang, email, password, jenis_kelamin, alamat } = req.body;
    const sql = `INSERT INTO users (nama_depan, nama_belakang, email, password, jenis_kelamin, alamat) VALUES (?, ?, ?, ?, ?, ?)`;
    db.query(sql, [nama_depan, nama_belakang, email, password, jenis_kelamin, alamat], (err, result) => {
        if (err) return res.status(500).json({ success: false });
        res.json({ success: true, message: 'Register Berhasil' });
    });
});

app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    const sql = 'SELECT * FROM users WHERE email = ? AND password = ?';
    db.query(sql, [email, password], (err, result) => {
        if (err) return res.status(500).json({ success: false });
        if (result.length > 0) res.json({ success: true, user: result[0] });
        else res.status(401).json({ success: false, message: 'Salah email/pass' });
    });
});

app.post('/api/pesanan', (req, res) => {
    const { nama_user, kategori, deskripsi, alamat, foto } = req.body;
    const sql = "INSERT INTO pesanan (nama_user, kategori_jasa, deskripsi_masalah, alamat, `Foto masalah`) VALUES (?, ?, ?, ?, ?)";
    db.query(sql, [nama_user, kategori, deskripsi, alamat, foto], (err, result) => {
        if (err) return res.status(500).json({ success: false });
        res.json({ success: true, message: 'Pesanan Terkirim!' });
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

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server berjalan di: http://localhost:${PORT}`);
});