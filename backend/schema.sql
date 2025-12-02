-- Sturdeon AI Database Schema

-- Users Table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255),
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    profile_picture_url TEXT,
    oauth_provider VARCHAR(50),
    oauth_id VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false,
    subscription_plan VARCHAR(50) DEFAULT 'free',
    credits INT DEFAULT 100,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);
    
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_oauth ON users(oauth_provider, oauth_id);

-- Wins Table
CREATE TABLE wins (
    id SERIAL PRIMARY KEY,
    opportunity_title VARCHAR(500) NOT NULL,
    agency VARCHAR(255),
    amount DECIMAL(15, 2),
    contract_number VARCHAR(255),
    description TEXT,
    date_won DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_wins_date_won ON wins(date_won);
CREATE INDEX idx_wins_agency ON wins(agency);