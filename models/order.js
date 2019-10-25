const Sequelize = require('sequelize');
const sequelize = require('../config/db');
const User = require('./user');
const Order = sequelize.define('orders', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    orderId: Sequelize.STRING(255),
    customerName: Sequelize.STRING(255),
    customerEmail: Sequelize.STRING(255),    
    orderAmount: Sequelize.STRING(255),
    ip_address: Sequelize.STRING(255),
    created_at: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
    updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
})

Order.belongsTo(User);
module.exports = Order;