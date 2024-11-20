import Sequelize from 'sequelize'
import dotenv from 'dotenv'
import SkatersModel from './skaters.model.js'

dotenv.config()

const sequelize = new Sequelize(
  process.env.DB,
  process.env.USER,
  process.env.PASSWORD,
  {
    host: process.env.HOST,
    port: parseInt(process.env.PORT, 10),
    dialect: process.env.DIALECT,
    pool: {
      max: parseInt(process.env.POOL_MAX, 10),
      min: parseInt(process.env.POOL_MIN, 10),
      acquire: parseInt(process.env.POOL_ACQUIRE, 10),
      idle: parseInt(process.env.POOL_IDLE, 10)
    }
  }
)

const db = {
  Sequelize,
  sequelize,
  skaters: SkatersModel(sequelize, Sequelize)
}

export default db
