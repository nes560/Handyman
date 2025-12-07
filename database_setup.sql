-- ==========================================
-- SQL UNTUK MENAMBAHKAN KOLOM tipe_pengguna
-- ==========================================

-- Jika tabel sudah ada dan belum punya kolom tipe_pengguna, jalankan:
ALTER TABLE users ADD COLUMN tipe_pengguna VARCHAR(50) DEFAULT 'pelanggan' AFTER alamat;

-- ATAU jika ingin membuat ulang tabel users dari awal:
-- DROP TABLE IF EXISTS users;
-- CREATE TABLE users (
--     id INT AUTO_INCREMENT PRIMARY KEY,
--     nama_depan VARCHAR(100) NOT NULL,
--     nama_belakang VARCHAR(100) NOT NULL,
--     email VARCHAR(100) UNIQUE NOT NULL,
--     password VARCHAR(100) NOT NULL,
--     jenis_kelamin VARCHAR(20),
--     alamat TEXT,
--     tipe_pengguna VARCHAR(50) DEFAULT 'pelanggan',
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );
