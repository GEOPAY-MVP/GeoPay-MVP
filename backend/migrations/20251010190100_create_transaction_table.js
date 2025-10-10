exports.up = (pgm) => {
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
  pgm.createIndex('transaction', 'wallet_id', { name: 'idx_transaction_wallet' });
  pgm.createIndex('transaction', 'receiver_id', { name: 'idx_transaction_receiver' });
  pgm.createIndex('transaction', 'transaction_type', { name: 'idx_transaction_type' });
  pgm.createIndex('transaction', 'status', { name: 'idx_transaction_status' });
  pgm.createIndex('transaction', ['created_at DESC'], { name: 'idx_transaction_created' });
};

exports.down = (pgm) => {
  // Drop indexes
  pgm.dropIndex('transaction', 'idx_transaction_created');
  pgm.dropIndex('transaction', 'idx_transaction_status');
  pgm.dropIndex('transaction', 'idx_transaction_type');
  pgm.dropIndex('transaction', 'idx_transaction_receiver');
  pgm.dropIndex('transaction', 'idx_transaction_wallet');

  // Drop constraints
  pgm.dropConstraint('transaction', 'chk_amount');
  pgm.dropConstraint('transaction', 'chk_transaction_status');
  pgm.dropConstraint('transaction', 'chk_transaction_type');

  // Drop table
  pgm.dropTable('transaction');
};
