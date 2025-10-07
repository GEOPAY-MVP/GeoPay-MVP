exports.up = pgm => {
  // Enable UUID extension (for uuid_generate_v4)
  pgm.sql(`CREATE EXTENSION IF NOT EXISTS "pgcrypto";`);

  // Create user table
  pgm.createTable('user', {
    user_id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()')},
    full_name: { type: 'varchar(255)', notNull: true },
    email: { type: 'varchar(255)', notNull: true, unique: true },
    phone_number: { type: 'varchar(20)', notNull: true, unique: true },
    cnic: { type: 'varchar(15)', notNull: true, unique: true },
    date_of_birth: { type: 'date', notNull: true },
    address: { type: 'text' },
    password_hash: { type: 'varchar(255)', notNull: true },
    pin: { type: 'varchar(6)', notNull: true },
    kyc_status: { type: 'varchar(50)', notNull: true, default: 'pending' },
    is_two_fa_enabled: { type: 'boolean', default: false },
    two_fa_method: { type: 'varchar(50)' }, // field name must be quoted since it starts with number
    status: { type: 'varchar(50)', notNull: true, default: 'active' },
    registered_at: { type: 'timestamp', notNull: true, default: pgm.func('CURRENT_TIMESTAMP') },
    last_login_at: { type: 'timestamp' },
  });

  // Constraints
  pgm.addConstraint('user', 'chk_kyc_status', {
    check: `kyc_status IN ('pending', 'verified', 'rejected', 'under_review')`
  });

  pgm.addConstraint('user', 'chk_user_status', {
    check: `status IN ('active', 'inactive', 'suspended', 'blocked')`
  });
};

exports.down = pgm => {
  pgm.dropTable('user');
};
