exports.up = (pgm) => {
  // Enable UUID extension
  pgm.sql(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);

  // Create wallet table
  pgm.createTable('wallet', {
    wallet_id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('uuid_generate_v4()'),
    },
    user_id: {
      type: 'uuid',
      notNull: true,
      references: '"user"(user_id)',
      onDelete: 'CASCADE',
    },
    currency_code: {
      type: 'varchar(3)',
      notNull: true,
      default: "'PKR'",
    },
    available_balance: {
      type: 'decimal(15,2)',
      notNull: true,
      default: 0.00,
    },
    pending_balance: {
      type: 'decimal(15,2)',
      notNull: true,
      default: 0.00,
    },
    status: {
      type: 'varchar(50)',
      notNull: true,
      default: "'active'",
    },
    created_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('CURRENT_TIMESTAMP'),
    },
    updated_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('CURRENT_TIMESTAMP'),
    },
  });

  // Add wallet constraints
  pgm.addConstraint('wallet', 'chk_wallet_status', {
    check: "status IN ('active', 'frozen', 'suspended', 'closed')",
  });
  pgm.addConstraint('wallet', 'chk_available_balance', {
    check: 'available_balance >= 0',
  });
  pgm.addConstraint('wallet', 'chk_pending_balance', {
    check: 'pending_balance >= 0',
  });

  // Create indexes
  pgm.createIndex('wallet', 'user_id', { name: 'idx_wallet_user' });
  pgm.createIndex('wallet', 'status', { name: 'idx_wallet_status' });

  // Create trigger function
  pgm.sql(`
    CREATE OR REPLACE FUNCTION update_wallet_timestamp()
    RETURNS TRIGGER AS $$
    BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `);

  // Create trigger
  pgm.sql(`
    CREATE TRIGGER trg_wallet_updated_at
    BEFORE UPDATE ON wallet
    FOR EACH ROW
    EXECUTE FUNCTION update_wallet_timestamp();
  `);
};

exports.down = (pgm) => {
  // Drop trigger and function
  pgm.sql(`DROP TRIGGER IF EXISTS trg_wallet_updated_at ON wallet;`);
  pgm.sql(`DROP FUNCTION IF EXISTS update_wallet_timestamp;`);

  // Drop indexes
  pgm.dropIndex('wallet', 'idx_wallet_status');
  pgm.dropIndex('wallet', 'idx_wallet_user');

  // Drop constraints
  pgm.dropConstraint('wallet', 'chk_pending_balance');
  pgm.dropConstraint('wallet', 'chk_available_balance');
  pgm.dropConstraint('wallet', 'chk_wallet_status');

  // Drop table
  pgm.dropTable('wallet');
};
