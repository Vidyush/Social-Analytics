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
  postsWithSentiment: Sequelize.JSON,
  count: { type: Sequelize.INTEGER, defaultValue: 1 },
  hashtagArray:Sequelize.JSON,
  createdAt : Sequelize.DATE,
  media:Sequelize.STRING(20)
});

Keyword.belongsTo(User);

module.exports = Keyword;
