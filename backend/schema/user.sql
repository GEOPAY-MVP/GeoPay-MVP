CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE "user" (
  user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  phone_number VARCHAR(20) NOT NULL UNIQUE,
  cnic VARCHAR(15) NOT NULL UNIQUE,
  date_of_birth DATE NOT NULL,
  address TEXT,
  password_hash VARCHAR(255) NOT NULL,
  pin VARCHAR(6) NOT NULL,
  kyc_status VARCHAR(50) NOT NULL DEFAULT 'pending',
  is_two_fa_enabled BOOLEAN DEFAULT FALSE,
  two_fa_method VARCHAR(50),
  status VARCHAR(50) NOT NULL DEFAULT 'active',
  registered_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_login_at TIMESTAMP
);

ALTER TABLE "user"
  ADD CONSTRAINT chk_kyc_status CHECK (kyc_status IN ('pending', 'verified', 'rejected', 'under_review'));

ALTER TABLE "user"
  ADD CONSTRAINT chk_user_status CHECK (status IN ('active', 'inactive', 'suspended', 'blocked'));
