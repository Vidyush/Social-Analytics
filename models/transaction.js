const Sequelize = require('sequelize');
const sequelize = require('../config/db');

const transactions = sequelize.define('transactions', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    orderId: Sequelize.STRING(255),
    orderAmount:{type:Sequelize.INTEGER},
    referenceId:{type:Sequelize.STRING(255)},
    paymentMode:{type:Sequelize.STRING(255)},
    txStatus:{type:Sequelize.STRING(255)},
    txMsg:{type:Sequelize.STRING(255)},
    txTime:{type:Sequelize.STRING(255)},
    signature:{type:Sequelize.STRING(255)},
    created_at: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
    updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
})

module.exports = transactions;