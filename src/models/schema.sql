CREATE DATABASE IF NOT EXISTS performance_db;
CREATE TABLE IF NOT EXISTS division (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    CONSTRAINT uk_division_name UNIQUE (name)
);

CREATE TABLE IF NOT EXISTS user (
    uid INT AUTO_INCREMENT PRIMARY KEY,
    role ENUM('admin', 'employee', 'supervisor') NOT NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    password VARCHAR(255) NOT NULL,
    photo VARCHAR(255) DEFAULT NULL,
    gender ENUM('male', 'female', 'other') DEFAULT NULL,
    division_id INT DEFAULT NULL,
    CONSTRAINT uk_user_email UNIQUE (email),
    CONSTRAINT fk_user_division FOREIGN KEY (division_id) 
        REFERENCES division(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS type (
    tid INT AUTO_INCREMENT PRIMARY KEY,
    typeofevaluation VARCHAR(100) NOT NULL,
    section_percentage DECIMAL(5,2) NOT NULL DEFAULT 0.00 CHECK (section_percentage BETWEEN 0 AND 100),
    CONSTRAINT uk_type_name UNIQUE (typeofevaluation)
);

CREATE TABLE IF NOT EXISTS criteria (
    cid INT AUTO_INCREMENT PRIMARY KEY,
    tid INT NOT NULL,
    criteria TEXT NOT NULL,
    weight DECIMAL(5,2) NOT NULL CHECK (weight BETWEEN 0 AND 100),
    level TINYINT NOT NULL CHECK (level BETWEEN 1 AND 4),
    CONSTRAINT fk_criteria_type FOREIGN KEY (tid) 
        REFERENCES type(tid) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS self_evaluation (
    eid INT AUTO_INCREMENT PRIMARY KEY,
    uid INT NOT NULL,  
    tid INT DEFAULT NULL,
    criteria TEXT NOT NULL,
    weight DECIMAL(5,2) NOT NULL CHECK (weight BETWEEN 0 AND 100),
    level TINYINT NOT NULL CHECK (level BETWEEN 1 AND 4),
    result DECIMAL(8,3) DEFAULT NULL,
    period ENUM('Q1', 'Q2', 'Q3', 'Q4') NOT NULL,
    CONSTRAINT fk_self_user FOREIGN KEY (uid) 
        REFERENCES user(uid) ON DELETE CASCADE,
    CONSTRAINT fk_self_type FOREIGN KEY (tid) 
        REFERENCES type(tid) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS peer_evaluation (
    eid INT AUTO_INCREMENT PRIMARY KEY,
    uid INT NOT NULL,
    evaluator_uid INT NOT NULL,  
    tid INT DEFAULT NULL,
    criteria TEXT NOT NULL,
    weight DECIMAL(5,2) NOT NULL CHECK (weight BETWEEN 0 AND 100),
    level TINYINT NOT NULL CHECK (level BETWEEN 1 AND 4),
    result DECIMAL(8,3) DEFAULT NULL,
    period ENUM('Q1', 'Q2', 'Q3', 'Q4') NOT NULL,
    CONSTRAINT fk_peer_evaluatee FOREIGN KEY (uid) 
        REFERENCES user(uid) ON DELETE CASCADE,
    CONSTRAINT fk_peer_evaluator FOREIGN KEY (evaluator_uid) 
        REFERENCES user(uid) ON DELETE CASCADE,
    CONSTRAINT fk_peer_type FOREIGN KEY (tid) 
        REFERENCES type(tid) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS supervisor_evaluation (
    eid INT AUTO_INCREMENT PRIMARY KEY,
    uid INT NOT NULL, 
    supervisor_uid INT NOT NULL, 
    tid INT DEFAULT NULL,
    criteria TEXT NOT NULL,
    weight DECIMAL(5,2) NOT NULL CHECK (weight BETWEEN 0 AND 100),
    level TINYINT NOT NULL CHECK (level BETWEEN 1 AND 4),
    result DECIMAL(8,3) DEFAULT NULL,
    period ENUM('Q1', 'Q2', 'Q3', 'Q4') NOT NULL,
    CONSTRAINT fk_supervisor_evaluatee FOREIGN KEY (uid) 
        REFERENCES user(uid) ON DELETE CASCADE,
    CONSTRAINT fk_supervisor_evaluator FOREIGN KEY (supervisor_uid) 
        REFERENCES user(uid) ON DELETE CASCADE,
    CONSTRAINT fk_supervisor_type FOREIGN KEY (tid) 
        REFERENCES type(tid) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS report (
    rid INT AUTO_INCREMENT PRIMARY KEY,
    uid INT NOT NULL,
    period ENUM('Q1', 'Q2', 'Q3', 'Q4') NOT NULL,
    summary TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_report_user FOREIGN KEY (uid) 
        REFERENCES user(uid) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS group_info (
    gid INT AUTO_INCREMENT PRIMARY KEY,
    division_id INT NOT NULL,
    created_by INT DEFAULT NULL,
    CONSTRAINT fk_group_info_division FOREIGN KEY (division_id) 
        REFERENCES division(id) ON DELETE CASCADE,
    CONSTRAINT fk_group_info_creator FOREIGN KEY (created_by) 
        REFERENCES user(uid) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS `group` (
    gid INT NOT NULL,
    uid INT NOT NULL,
    PRIMARY KEY (gid, uid),
    CONSTRAINT fk_group_group_info FOREIGN KEY (gid) 
        REFERENCES group_info(gid) ON DELETE CASCADE,
    CONSTRAINT fk_group_user FOREIGN KEY (uid) 
        REFERENCES user(uid) ON DELETE CASCADE
);