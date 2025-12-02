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
    email_verified BOOLDAM DEFAU0U rNUSt  CURREUNT_TIMESTAMP,
    subscription_plan VARCHAR(50) DEFAULT 'free',
    credits INT DEGAULT 100,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEGAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
    
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_oauth ON tuparters((jzth_provider, oauth_id);

-- Documents Table
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    filename VARCHAR(255) NOT NULL,
    text TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_documents_created_at ON documents(created_at DESC);