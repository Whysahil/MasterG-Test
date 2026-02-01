
-- ==========================================================
-- MasterG: High-Performance Enterprise Schema
-- Architect: Senior DBMS Architect
-- Optimizations: Indexing, Triggers, Partitioning Support
-- ==========================================================

DROP DATABASE IF EXISTS masterg_db;
CREATE DATABASE masterg_db;
USE masterg_db;

-- ==========================================================
-- 1. AUTHENTICATION & SESSION MANAGEMENT
-- ==========================================================

CREATE TABLE roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_code VARCHAR(20) NOT NULL UNIQUE, -- STRICT SEPARATION: ADMxxx vs STUxxx
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role_id INT NOT NULL,
    streak_days INT DEFAULT 0,
    is_blocked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES roles(id),
    -- Index for fast login lookups
    INDEX idx_user_email (email),
    INDEX idx_user_code (user_code)
);

-- Secure Session Management
CREATE TABLE refresh_tokens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_token_lookup (token_hash)
);

-- ==========================================================
-- 2. EXAM DATA (Static Content - Candidate for Caching)
-- ==========================================================

CREATE TABLE exams (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE subjects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE tests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    exam_id INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    type ENUM('MOCK', 'PYQ', 'SECTIONAL', 'UNLIMITED') DEFAULT 'MOCK',
    duration_minutes INT NOT NULL, 
    total_marks DECIMAL(5,2) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (exam_id) REFERENCES exams(id),
    -- Index for filtering tests quickly
    INDEX idx_test_filter (exam_id, is_active, type)
);

-- ==========================================================
-- 3. QUESTION BANK & REAL-TIME STATS
-- ==========================================================

CREATE TABLE questions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    test_id INT NULL, 
    subject_id INT NOT NULL,
    content TEXT NOT NULL,
    positive_marks DECIMAL(3,2) NOT NULL DEFAULT 1.0,
    negative_marks DECIMAL(3,2) NOT NULL DEFAULT 0.25,
    difficulty_level ENUM('EASY', 'MEDIUM', 'HARD') DEFAULT 'MEDIUM',
    status ENUM('DRAFT', 'PUBLISHED') DEFAULT 'PUBLISHED',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (test_id) REFERENCES tests(id) ON DELETE SET NULL,
    FOREIGN KEY (subject_id) REFERENCES subjects(id),
    
    -- Covering Index for "Unlimited Mode" Query Performance
    INDEX idx_q_fetch (subject_id, test_id, difficulty_level)
);

-- DENORMALIZATION: Real-time stats table
-- Updates via Trigger to avoid expensive COUNT() queries on read
CREATE TABLE question_stats (
    question_id INT PRIMARY KEY,
    times_attempted INT DEFAULT 0,
    times_correct INT DEFAULT 0,
    difficulty_score DECIMAL(5,2) DEFAULT 0.0, -- Calculated periodically
    FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
);

CREATE TABLE options (
    id INT AUTO_INCREMENT PRIMARY KEY,
    question_id INT NOT NULL,
    option_text TEXT NOT NULL,
    is_correct BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
);

-- ==========================================================
-- 4. HIGH VOLUME TRANSACTION TABLES
-- ==========================================================

CREATE TABLE attempt_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    test_id INT NOT NULL,
    score DECIMAL(5,2) DEFAULT 0.0,
    accuracy DECIMAL(5,2) DEFAULT 0.0,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    status ENUM('COMPLETED', 'ABANDONED') DEFAULT 'COMPLETED',
    
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (test_id) REFERENCES tests(id),
    
    -- Composite Index for Leaderboard (Covering Index)
    INDEX idx_leaderboard (test_id, score DESC, user_id),
    -- Index for User History
    INDEX idx_user_history (user_id, end_time DESC)
);

CREATE TABLE attempt_details (
    id INT AUTO_INCREMENT PRIMARY KEY,
    attempt_id INT NOT NULL,
    question_id INT NOT NULL,
    selected_option_id INT, 
    is_correct BOOLEAN DEFAULT FALSE,
    time_spent_seconds INT DEFAULT 0,
    
    FOREIGN KEY (attempt_id) REFERENCES attempt_history(id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES questions(id),
    
    -- Critical for "Questions I haven't attempted" query
    INDEX idx_user_q_check (attempt_id, question_id)
);

-- ==========================================================
-- 5. AUDIT & LOGS
-- ==========================================================

CREATE TABLE audit_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    admin_id INT NOT NULL,
    action_type VARCHAR(50) NOT NULL,
    details TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_id) REFERENCES users(id)
);

-- ==========================================================
-- 6. TRIGGERS (DBMS MAGIC)
-- ==========================================================

DELIMITER //

-- Automatically update question stats after every attempt
-- This removes the need for expensive JOIN/GROUP BY queries for analytics
CREATE TRIGGER after_attempt_detail_insert
AFTER INSERT ON attempt_details
FOR EACH ROW
BEGIN
    INSERT INTO question_stats (question_id, times_attempted, times_correct)
    VALUES (NEW.question_id, 1, IF(NEW.is_correct, 1, 0))
    ON DUPLICATE KEY UPDATE
        times_attempted = times_attempted + 1,
        times_correct = times_correct + IF(NEW.is_correct, 1, 0);
END; //

DELIMITER ;

-- ==========================================================
-- 7. SEED DATA
-- ==========================================================

INSERT INTO roles (name) VALUES ('student'), ('admin');
INSERT INTO subjects (name) VALUES ('Quant'), ('Reasoning'), ('GK'), ('English');
INSERT INTO exams (name, description) VALUES ('SSC CGL', 'Staff Selection'), ('Banking', 'IBPS PO'), ('Mixed', 'General Practice');

-- Seed Users with STRICT ID CODES
-- Password hash for 'password' (bcrypt placeholder)
INSERT INTO users (user_code, name, email, password_hash, role_id) VALUES 
('ADM001', 'MasterG Admin', 'admin@masterg.com', '$2b$10$w1...', 2),
('STU1001', 'Rahul Student', 'student@example.com', '$2b$10$w1...', 1);

-- Core Fixed Tests
INSERT INTO tests (exam_id, title, type, duration_minutes, total_marks) VALUES 
(3, '10-Question Quick Mock', 'MOCK', 15, 20),
(3, '25-Question Standard Mock', 'MOCK', 30, 50),
(1, 'Infinite Practice', 'UNLIMITED', 0, 0);
