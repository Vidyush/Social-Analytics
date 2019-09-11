const Sequelize = require('sequelize');
const sequelize = require('../config/db');

const Keyword = sequelize.define('keywords', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    keyword: Sequelize.STRING(255),
    user: Sequelize.STRING(255),    
    wpath: Sequelize.STRING(255),//wordcloud path
    rhpath: Sequelize.STRING(255),//related hastag wordcloud path
    mapcloud:Sequelize.STRING(255),
    fullStream:Sequelize.JSON,
    dashboardJson:Sequelize.JSON,
    dateJson:Sequelize.JSON,
    count:{type:Sequelize.INTEGER,
        defaultValue:1}
})

module.exports = Keyword;