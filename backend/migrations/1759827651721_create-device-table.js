exports.up = pgm => {
  // Enable UUID extension (for uuid_generate_v4)
  pgm.sql(`CREATE EXTENSION IF NOT EXISTS "pgcrypto";`);

  // Create device table
  pgm.createTable('device', {
    device_id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()')},
    os_type: { type: 'varchar(50)', notNull: true },
    device_fingerprint: { type: 'varchar(255)', notNull: true, unique: true },
    device_name: { type: 'varchar(255)'},
    status: { type: 'varchar(50)', notNull: true, default: 'active' },
    is_biometric_enabled: { type: 'boolean', default: false },
    biometric_public_key: { type: 'text' },
    fcm_token: { type: 'text' },
  });
};

exports.down = pgm => {
  pgm.dropTable('user');
};