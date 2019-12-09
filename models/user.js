const Sequelize = require('sequelize');
const sequelize = require('../config/db');
const bcrypt = require("bcrypt");

const User = sequelize.define('users', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    name: Sequelize.STRING(255),
    email: Sequelize.STRING(255),    
    password: Sequelize.STRING(255),
    resetToken: Sequelize.STRING(255),
    resetTime: Sequelize.DATE,
    profilePic: Sequelize.STRING(255),
    joiningDate: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
    deletedAt: Sequelize.DATE,
  createdAt : Sequelize.DATE,
  deletedAt : Sequelize.DATE
})


User.beforeCreate((user, options) => {
    
    // adding hash sync way
    var hash = bcrypt.hashSync(user.password, 10);
    user.password = hash;
    
});


module.exports = User;