const { Sequelize } = require("sequelize");

module.exports = sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    dialect: "mysql",
    logging: false,
  }
);

//PRODUCTION DATABASE

// DB_HOST=buyjyxzhzkz4w9vannnl-mysql.services.clever-cloud.com
// DB_NAME=buyjyxzhzkz4w9vannnl
// DB_USER=umlnu9lxkqulbmme
// DB_PASS=9wS1c3DZyWPKsC2dDNgr
// DB_PORT=3306
