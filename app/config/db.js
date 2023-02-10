const Sequelize = require('sequelize');
const dotenv = require('dotenv');

dotenv.config();

module.exports =  new Sequelize(process.env.DATABASE_URL, 'root', null,{
  host: 'localhost',
  dialect: 'mysql'
});