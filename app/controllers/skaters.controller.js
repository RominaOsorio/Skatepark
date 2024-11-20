/* eslint-disable camelcase */
import db from '../models/index.js'
const { skaters: Skaters } = db

export const create = ({ email, nombre, password, anos_experiencia, especialidad, foto, estado }) => {
  return Skaters.create({
    email,
    nombre,
    password,
    anos_experiencia,
    especialidad,
    foto,
    estado
  })
    .then(newSkater => {
      console.log(`>> Se ha creado el skater: ${JSON.stringify(newSkater, null, 4)}`)
      return newSkater
    })
    .catch(err => {
      console.log(`>> Error al crear el skater: ${err}`)
    })
}

export const findById = (id) => {
  return Skaters.findByPk(id)
    .then(skater => {
      if (skater) {
        console.log(`>> Skater encontrado: ${JSON.stringify(skater, null, 4)}`)
      } else {
        console.log(`>> No se encontró el skater con ID ${id}`)
      }
      return skater
    })
    .catch(err => {
      console.log(`>> Error mientras se buscaba el skater: ${err}`)
    })
}

export const findAll = () => {
  return Skaters.findAll()
    .then(skaters => {
      console.log(`>> Skaters encontrados: ${JSON.stringify(skaters, null, 4)}`)
      return skaters
    })
    .catch(err => {
      console.log(`>> Error al obtener los skaters: ${err}`)
    })
}

export const updateById = (skaterId, updatedData) => {
  return Skaters.update(updatedData, {
    where: { id: skaterId }
  })
    .then(() => {
      return Skaters.findByPk(skaterId)
    })
    .then(updatedSkater => {
      if (updatedSkater) {
        console.log(`>> Skater actualizado: ${JSON.stringify(updatedSkater, null, 4)}`)
      } else {
        console.log(`>> No se encontró el skater con ID ${skaterId}`)
      }
      return updatedSkater
    })
    .catch(error => {
      console.log(`>> Error al actualizar el skater: ${error}`)
    })
}

export const deleteById = async (id) => {
  try {
    const skater = await db.skaters.findByPk(id)
    if (!skater) {
      return null
    }
    await skater.destroy()
    return skater
  } catch (error) {
    console.log(`>> Error al eliminar el skater: ${error}`)
  }
}
