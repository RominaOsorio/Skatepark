export default (sequelize, DataTypes) => {
  const Skaters = sequelize.define('skaters', {
    email: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true
      }
    },
    nombre: {
      type: DataTypes.STRING(25),
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    password: {
      type: DataTypes.STRING(25),
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    anos_experiencia: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isInt: true,
        min: 0
      }
    },
    especialidad: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    foto: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: true
      }
    }
  })
  return Skaters
}
