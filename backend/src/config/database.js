// backend/src/config/database.js

const { Sequelize } = require('sequelize');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  dialect: 'mysql',
  pool: {
    max: 20,        // Increased from 5 to 20
    min: 2,         // Increased from 0 to 2 (keep some connections ready)
    acquire: 60000, // Increased from 30000 to 60000 (60 seconds)
    idle: 30000,    // Increased from 10000 to 30000 (30 seconds)
    evict: 1000,    // Check for idle connections every 1 second
    handleDisconnects: true
  },
  logging: false
};

const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.user,
  dbConfig.password,
  {
    host: dbConfig.host,
    dialect: dbConfig.dialect,
    pool: dbConfig.pool,
    logging: dbConfig.logging
  }
);

module.exports = sequelize;