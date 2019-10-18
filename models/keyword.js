const Sequelize = require("sequelize");
const sequelize = require("../config/db");
const User = require("./user");

const Keyword = sequelize.define("keywords", {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  keyword: Sequelize.STRING(255),
  wpath: Sequelize.STRING(255), //wordcloud path
  rhpath: Sequelize.STRING(255), //related hastag wordcloud path
  fullStream: Sequelize.JSON,
  dashboardJson: Sequelize.JSON,
  dateJson: Sequelize.JSON,
  postsWithSentiment: Sequelize.JSON,
  count: { type: Sequelize.INTEGER, defaultValue: null }
});

Keyword.belongsTo(User);

module.exports = Keyword;
