const Sequelize = require("sequelize");

const sequelize = new Sequelize('mysql://127.0.0.1:3306/buzzabl', {
  username: "root",
  password: "password",
  dialect: "mysql",
  logging: false,
  //logging: console.log,
  define: {
    timestamps: true
  }
});

module.exports = sequelize;
