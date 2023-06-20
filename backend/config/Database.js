import { Sequelize } from "sequelize";
const db = new Sequelize('belajar_jwt', 'root', 'password', {
    host: 'localhost',
    dialect: 'mysql'
});

export default db;
