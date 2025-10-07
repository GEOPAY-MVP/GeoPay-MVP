CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE device (
  device_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  os_type VARCHAR(50) NOT NULL,
  device_fingerprint VARCHAR(255) NOT NULL UNIQUE,
  device_name VARCHAR(255),
  status VARCHAR(50) NOT NULL DEFAULT 'active',
  is_biometric_enabled BOOLEAN DEFAULT FALSE,
  biometric_public_key TEXT,
  fcm_token TEXT
);
