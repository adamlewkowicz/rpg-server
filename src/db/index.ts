import { Sequelize } from 'sequelize-typescript';
import { Character } from '../models/character';

const sequelize = new Sequelize({
  dialect: 'postgres',
  host: 'rpg-postgres',
  database: 'postgres',
  username: 'postgres',
  password: 'pwd',
  // modelPaths: [__dirname + '/**/*.ts']
});

sequelize.addModels([Character]);

export { sequelize as sequelize };