CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE user_device (
  user_device_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES "user"(user_id) ON DELETE CASCADE,
  device_id UUID NOT NULL REFERENCES device(device_id) ON DELETE CASCADE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  registered_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_active_at TIMESTAMP,
  trusted BOOLEAN DEFAULT false,
  CONSTRAINT uq_user_device UNIQUE (user_id, device_id)
);
