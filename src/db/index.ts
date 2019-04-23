import { Sequelize } from 'sequelize-typescript';
import { Player } from '../models/player';

const sequelize = new Sequelize({
  dialect: 'postgres',
  host: 'rpg-postgres',
  database: 'postgres',
  username: 'postgres',
  password: 'pwd',
  // modelPaths: [__dirname + '/**/*.ts']
});

sequelize.addModels([Player]);

export { sequelize as sequelize };