exports.up = (pgm) => {

  pgm.sql(`CREATE EXTENSION IF NOT EXISTS "pgcrypto";`);

  pgm.createTable('user_device', {
    user_device_id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('gen_random_uuid()'),
    },
    user_id: {
      type: 'uuid',
      notNull: true,
      references: '"user"',
      onDelete: 'CASCADE',
    },
    device_id: {
      type: 'uuid',
      notNull: true,
      references: 'device',
      onDelete: 'CASCADE',
    },
    is_active: {
      type: 'boolean',
      notNull: true,
      default: true, // changed to boolean true instead of 'active' string
    },
    registered_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('CURRENT_TIMESTAMP'),
    },
    last_active_at: {
      type: 'timestamp',
    },
    trusted: {
      type: 'boolean',
      default: false,
    },
  });

  // Add unique constraint for (user_id, device_id)
  pgm.addConstraint('user_device', 'uq_user_device', {
    unique: ['user_id', 'device_id'],
  });

};

exports.down = (pgm) => {
  pgm.dropTable('user_device');
};
