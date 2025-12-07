-- FILE: insert_test_pesanan.sql
-- Gunakan untuk insert test data ke tabel pesanan

-- Pastikan sudah ada tabel pesanan terlebih dahulu
-- Jika belum ada, run database_setup.sql terlebih dahulu

-- Clear existing data (optional)
-- DELETE FROM pesanan;

-- Insert test data
INSERT INTO pesanan (nama_user, kategori_jasa, deskripsi_masalah, alamat, `Foto masalah`)
VALUES 
    ('Budi Santoso', 'Listrik', 'Lampu ruang tamu korslet, bau hangus menyebar ke seluruh rumah', 'Jl. Merdeka No. 45, Jakarta Selatan', 'uploads/foto_lampu_1.jpg'),
    ('Siti Aminah', 'Pipa', 'Kran air patah, air muncrat terus dan menggenang di dapur', 'Komp. Griya Indah Blok A2, Jakarta Timur', 'uploads/foto_pipa_1.jpg'),
    ('Ahmad Dhani', 'AC', 'Perlu cuci AC rutin 3 unit, sudah setahun tidak dibersihkan', 'Apartemen Central Park lt 12, Jakarta Pusat', NULL),
    ('Dewi Kurnia', 'Pengecatan', 'Cat ulang kamar tidur utama, dinding mulai kusam dan terlihat kotor', 'Jl. Anggrek No. 22, Jakarta Barat', NULL),
    ('Rudi Hartono', 'Perbaikan Furnitur', 'Pintu lemari kayu retak dan tidak bisa ditutup rapat', 'Jl. Suryakencana No. 88, Bandung', 'uploads/foto_furnitur_1.jpg');

-- Verify insert
SELECT COUNT(*) as total_pesanan FROM pesanan;
SELECT * FROM pesanan ORDER BY id DESC;

-- NOTE: Untuk menjalankan file ini, gunakan:
-- mysql -u root -h localhost tukang_db < insert_test_pesanan.sql
-- atau copy-paste ke MySQL Workbench
