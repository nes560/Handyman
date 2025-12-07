-- Tambahkan kolom pembayaran ke tabel pesanan jika belum ada
ALTER TABLE pesanan ADD COLUMN payment_method VARCHAR(50) DEFAULT NULL;
ALTER TABLE pesanan ADD COLUMN payment_amount INT DEFAULT NULL;
ALTER TABLE pesanan ADD COLUMN payment_date TIMESTAMP NULL;
ALTER TABLE pesanan ADD COLUMN payment_proof VARCHAR(255) DEFAULT NULL;

-- Create payment records table
CREATE TABLE IF NOT EXISTS payment_records (
    id INT PRIMARY KEY AUTO_INCREMENT,
    pesanan_id INT NOT NULL,
    payment_method VARCHAR(50),
    payment_amount INT,
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    payment_proof VARCHAR(255),
    status VARCHAR(50) DEFAULT 'pending', -- pending, completed, failed
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (pesanan_id) REFERENCES pesanan(id)
);

-- Create QRIS settings table
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

-- Insert default QRIS settings
INSERT INTO qris_settings (merchant_name, merchant_phone, qris_image_path) 
VALUES ('HandyMan Payment', '+62 821 8888 8888', 'qris-code.png');
