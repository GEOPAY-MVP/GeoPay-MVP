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

  // Create transaction table
  pgm.createTable('transaction', {
    transaction_id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('uuid_generate_v4()'),
    },
    wallet_id: {
      type: 'uuid',
      notNull: true,
      references: 'wallet(wallet_id)',
      onDelete: 'CASCADE',
    },
    receiver_id: {
      type: 'uuid',
    },
    receiver_name: {
      type: 'varchar(255)',
    },
    transaction_type: {
      type: 'varchar(50)',
      notNull: true,
      default: "'pending'",
    },
    amount: {
      type: 'decimal(15,2)',
      notNull: true,
    },
    currency_code: {
      type: 'varchar(3)',
      notNull: true,
      default: "'PKR'",
    },
    status: {
      type: 'varchar(50)',
      notNull: true,
      default: "'pending'",
    },
    description: {
      type: 'text',
    },
    provider: {
      type: 'varchar(100)',
    },
    metadata: {
      type: 'jsonb',
    },
    created_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('CURRENT_TIMESTAMP'),
    },
    completed_at: {
      type: 'timestamp',
    },
  });

  // Add transaction constraints
  pgm.addConstraint('transaction', 'chk_transaction_type', {
    check: "transaction_type IN ('transfer', 'payment', 'topup', 'bill_payment', 'withdrawal', 'deposit', 'refund')",
  });
  pgm.addConstraint('transaction', 'chk_transaction_status', {
    check: "status IN ('pending', 'processing', 'completed', 'failed', 'cancelled', 'reversed')",
  });
  pgm.addConstraint('transaction', 'chk_amount', {
    check: 'amount > 0',
  });

  // Create indexes
  pgm.createIndex('wallet', 'idx_wallet_user', { columns: ['user_id'] });
  pgm.createIndex('wallet', 'idx_wallet_status', { columns: ['status'] });
  pgm.createIndex('transaction', 'idx_transaction_wallet', { columns: ['wallet_id'] });
  pgm.createIndex('transaction', 'idx_transaction_receiver', { columns: ['receiver_id'] });
  pgm.createIndex('transaction', 'idx_transaction_type', { columns: ['transaction_type'] });
  pgm.createIndex('transaction', 'idx_transaction_status', { columns: ['status'] });
  pgm.createIndex('transaction', 'idx_transaction_created', { 
    columns: ['created_at DESC'] 
  });

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
  // Drop trigger first
  pgm.sql(`DROP TRIGGER IF EXISTS trg_wallet_updated_at ON wallet;`);
  pgm.sql(`DROP FUNCTION IF EXISTS update_wallet_timestamp();`);
  
  // Drop indexes
  pgm.dropIndex('transaction', 'idx_transaction_created');
  pgm.dropIndex('transaction', 'idx_transaction_status');
  pgm.dropIndex('transaction', 'idx_transaction_type');
  pgm.dropIndex('transaction', 'idx_transaction_receiver');
  pgm.dropIndex('transaction', 'idx_transaction_wallet');
  pgm.dropIndex('wallet', 'idx_wallet_status');
  pgm.dropIndex('wallet', 'idx_wallet_user');
  
  // Drop constraints
  pgm.dropConstraint('transaction', 'chk_amount');
  pgm.dropConstraint('transaction', 'chk_transaction_status');
  pgm.dropConstraint('transaction', 'chk_transaction_type');
  pgm.dropConstraint('wallet', 'chk_pending_balance');
  pgm.dropConstraint('wallet', 'chk_available_balance');
  pgm.dropConstraint('wallet', 'chk_wallet_status');
  
  // Drop tables
  pgm.dropTable('transaction');
  pgm.dropTable('wallet');
};