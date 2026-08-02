-- 1. Tạo Database tên là student_management
CREATE DATABASE IF NOT EXISTS student_management;
USE student_management;

-- 2. Tạo bảng users để đăng nhập
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL, -- Mật khẩu này sau này code Go sẽ mã hóa rồi mới lưu
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Tạo bảng students để quản lý thông tin sinh viên
CREATE TABLE IF NOT EXISTS students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_code VARCHAR(20) NOT NULL UNIQUE, -- Mã số sinh viên (ví dụ: B19DCCN001)
    full_name VARCHAR(100) NOT NULL,
    date_of_birth DATE NOT NULL,               -- Ngày tháng năm sinh
    email VARCHAR(100) UNIQUE,
    gender VARCHAR(10),                        -- Giới tính
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 4. Chèn thử 1 tài khoản mẫu để lát nữa làm tính năng Đăng nhập
-- Mật khẩu mặc định trong database tạm thời là '123456' (sau này code Go mình sẽ xử lý bảo mật sau)
INSERT INTO users (username, password) VALUES ('admin', '123456');
