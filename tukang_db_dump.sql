-- tukang_db_dump.sql
-- Dumped minimal schema and sample data for tukang_db
-- SAFE TO IMPORT: Run on an empty or new database

SET FOREIGN_KEY_CHECKS=0;

CREATE DATABASE IF NOT EXISTS `tukang_db` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `tukang_db`;

-- Table: users
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nama_depan` varchar(100) NOT NULL,
  `nama_belakang` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL UNIQUE,
  `password` varchar(255) NOT NULL,
  `jenis_kelamin` varchar(20) DEFAULT NULL,
  `alamat` TEXT DEFAULT NULL,
  `tipe_pengguna` varchar(50) DEFAULT 'pelanggan',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table: pesanan
DROP TABLE IF EXISTS `pesanan`;
CREATE TABLE `pesanan` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nama_user` varchar(255),
  `kategori_jasa` varchar(255),
  `deskripsi_masalah` text,
  `alamat` text,
  `status` varchar(50) DEFAULT 'Pending',
  `Foto masalah` varchar(255) DEFAULT NULL,
  `payment_method` varchar(50) DEFAULT NULL,
  `payment_amount` int DEFAULT NULL,
  `payment_date` TIMESTAMP NULL DEFAULT NULL,
  `payment_proof` varchar(255) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table: chats
DROP TABLE IF EXISTS `chats`;
CREATE TABLE `chats` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_email` varchar(150) DEFAULT NULL,
  `sender_role` varchar(50) DEFAULT NULL,
  `message` text,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table: qris_settings
DROP TABLE IF EXISTS `qris_settings`;
CREATE TABLE `qris_settings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `qris_image_path` varchar(255) DEFAULT NULL,
  `merchant_name` varchar(255) DEFAULT NULL,
  `merchant_id` varchar(100) DEFAULT NULL,
  `merchant_phone` varchar(50) DEFAULT NULL,
  `is_active` boolean DEFAULT TRUE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table: payment_records
DROP TABLE IF EXISTS `payment_records`;
CREATE TABLE `payment_records` (
  `id` int NOT NULL AUTO_INCREMENT,
  `pesanan_id` int NOT NULL,
  `payment_method` varchar(50) DEFAULT NULL,
  `payment_amount` int DEFAULT NULL,
  `payment_date` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `payment_proof` varchar(255) DEFAULT NULL,
  `status` varchar(50) DEFAULT 'pending',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX (`pesanan_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Sample data: users (passwords are plain for demo; change in production)
INSERT INTO `users` (nama_depan, nama_belakang, email, password, jenis_kelamin, alamat, tipe_pengguna)
VALUES
('Admin','System','admin@example.com','admin123','L','Jalan Admin','pelanggan'),
('Budi','Listrik','budi.listrik@example.com','tukang123','L','Jl. Listrik No 5','tukang'),
('Siti','Pelanggan','siti.user@example.com','pelanggan123','P','Jl. Pelanggan No 1','pelanggan');

-- Sample data: qris_settings
INSERT INTO `qris_settings` (qris_image_path, merchant_name, merchant_phone, is_active)
VALUES ('qris-code.png', 'HandyMan Payment', '+62 821 8888 8888', 1);

-- Sample data: pesanan
INSERT INTO `pesanan` (nama_user, kategori_jasa, deskripsi_masalah, alamat, status)
VALUES
('Siti Pelanggan','Listrik','Mati total di kamar','Jl. Pelanggan No 1','Pending'),
('Budi Listrik','Pipa','Kebocoran pipa di dapur','Jl. Listrik No 5','proses');

SET FOREIGN_KEY_CHECKS=1;
