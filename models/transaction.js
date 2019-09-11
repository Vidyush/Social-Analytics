const Sequelize = require('sequelize');
const sequelize = require('../config/db');

const transactions = sequelize.define('transactions', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    orderId: Sequelize.STRING(255),
    created_at: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
    updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
})

module.exports = transactions;