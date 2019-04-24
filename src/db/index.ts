import { Sequelize } from 'sequelize-typescript';
import { Character } from '../models/character';
import { Map } from '../models/Map';
import { CharacterPosition } from '../models/CharacterPosition';

const sequelize = new Sequelize({
  dialect: 'postgres',
  host: 'rpg-postgres',
  database: 'postgres',
  username: 'postgres',
  password: 'pwd',
  // modelPaths: [__dirname + '/**/*.ts']
});

sequelize.addModels([Character, Map, CharacterPosition]);

export { sequelize as sequelize };