/* eslint-disable camelcase */
import express from 'express'
import exphbs from 'express-handlebars'
import db from './app/models/index.js'
import path, { dirname } from 'path'
import { fileURLToPath } from 'url'
import { create, findAll, findById, updateById, deleteById } from './app/controllers/skaters.controller.js'
import skaters from './data/dataSkaters.js'
import jwt from 'jsonwebtoken'
import fileUpload from 'express-fileupload'

const __dirname = dirname(fileURLToPath(import.meta.url))
const app = express()
const PORT = 3000

// Middlewares
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, 'public')))
app.use('/bootstrap', express.static(path.join(__dirname, 'node_modules/bootstrap/dist')))
app.use(fileUpload({
  limits: { fileSize: 50000000 },
  abortOnLimit: true,
  responseOnLimit: 'El peso del archivo supera el límite establecido de 50MB'
}))

// Configuración de Handlebars
app.engine(
  'handlebars',
  exphbs.engine({
    defaultLayout: 'main',
    layoutsDir: path.join(__dirname, 'views', 'layouts'),
    partialsDir: path.join(__dirname, 'views', 'components'),
    runtimeOptions: {
      allowProtoPropertiesByDefault: true,
      allowProtoMethodsByDefault: true
    }
  })
)
app.set('view engine', 'handlebars')

// Configuración de JWT
const secretKey = '123456'

const generarToken = (email) => {
  return jwt.sign({ email }, secretKey, { expiresIn: '5m' })
}

const verificarAutenticacion = (req, res, next) => {
  const token = req.query.token

  if (token) {
    jwt.verify(token, secretKey, (err, userData) => {
      if (err) {
        return res.redirect('/login')
      }
      req.user = userData.email
      next()
    })
  } else {
    next()
  }
}

app.use(verificarAutenticacion)

// Sincronizar la base de datos
db.sequelize.sync(
  // { force: true }
)
  .then(() => run())
  .catch((err) => console.error('Error al sincronizar la base de datos:', err))

const run = async () => {
  try {
    const existingSkaters = await db.skaters.findAll()
    if (existingSkaters.length === 0) {
      for (const skater of skaters) {
        await create(skater)
      }
    }
  } catch (error) {
    console.error('Error al cargar los skaters:', error.message)
  }
}

// Rutas
app.get('/', (req, res) => {
  res.render('home', {
    title: 'SkatePark',
    isHome: true
  })
})

// Registro
app.get('/registro', (req, res) => {
  res.render('registro', {
    title: 'Registro',
    isRegisterPage: true
  })
})

app.post('/registro', async (req, res) => {
  try {
    const { email, nombre, password, anos_experiencia, especialidad } = req.body
    const { foto } = req.files

    const fotoPath = path.join(__dirname, 'public/img', foto.name)
    await foto.mv(fotoPath)

    await create({
      email,
      nombre,
      password,
      anos_experiencia,
      especialidad,
      foto: `img/${foto.name}`,
      estado: true
    })

    res.redirect('/login')
  } catch (error) {
    res.status(500).send('Error al registrar el usuario.')
  }
})

// Login
app.get('/login', (req, res) => {
  res.render('login', { title: 'Inicio Sesión', isLoginPage: true, user: req.user })
})

app.post('/login', async (req, res) => {
  const { email, password } = req.body
  const skater = await db.skaters.findOne({ where: { email } })

  if (!skater || skater.password !== password) {
    return res.status(401).json({ error: 'Credenciales inválidas' })
  }

  const token = generarToken(email)
  const skaterId = skater.id

  res.redirect(`/dashboard?userId=${skaterId}&token=${token}`)
})

// Perfil
app.get('/perfil/:id', async (req, res) => {
  const { id } = req.params
  const token = req.query.token

  if (!token) {
    return res.redirect('/login')
  }

  jwt.verify(token, secretKey, async (err) => {
    if (err) {
      return res.redirect('/login')
    }

    try {
      const skater = await findById(id)

      if (!skater) {
        return res.status(404).render('404', { message: 'Skater no encontrado.' })
      }

      res.render('perfil', {
        title: 'Perfil',
        skater: {
          id: skater.id,
          email: skater.email,
          nombre: skater.nombre,
          anos_experiencia: skater.anos_experiencia,
          password: skater.password,
          especialidad: skater.especialidad
        },
        user: req.user,
        isProfilePage: true
      })
    } catch (error) {
      console.error('Error al buscar el skater:', error)
      return res.status(500).render('500', { message: 'Error en el servidor' })
    }
  })
})

// Actualizar perfil
app.put('/perfil/:id', async (req, res) => {
  const { id } = req.params
  const { email, nombre, password, anos_experiencia, especialidad, foto, estado } = req.body

  try {
    const updatedSkater = await updateById(id, { email, nombre, password, anos_experiencia, especialidad, foto, estado })

    if (!updatedSkater) {
      return res.status(404).json({ message: 'Skater no encontrado.' })
    }

    return res.status(200).json({ message: 'Perfil actualizado exitosamente.', skater: updatedSkater })
  } catch (error) {
    return res.status(500).json({ message: 'Hubo un error al intentar actualizar el perfil.' })
  }
})

// Eliminar perfil
app.delete('/perfil/:id', async (req, res) => {
  const id = req.params.id
  try {
    const deletedSkater = await deleteById(id)
    if (!deletedSkater) {
      return res.status(404).json({ message: 'Skater no encontrado' })
    }
    res.json({ message: 'Skater eliminado correctamente', skater: deletedSkater })
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar skater' })
  }
})

// Dashboard
app.get('/dashboard', async (req, res) => {
  try {
    const skaters = await findAll()
    const plainSkaters = skaters.map((skater) => skater.toJSON())
    const userId = req.query.userId

    const token = generarToken(req.user)

    res.render('dashboard', {
      title: 'Dashboard',
      mensaje: 'Lista de participantes',
      skaters: plainSkaters,
      user: req.user,
      userId,
      token,
      isDashboardPage: true
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Logout
app.get('/logout', (req, res) => {
  res.redirect('/')
})

// Rutas no encontradas
app.all('*', (req, res) => res.status(404).json({ status: 'not found' }))

app.listen(PORT, () => {
  console.log(`Servidor inicializado en http://localhost:${PORT}`)
})

export default app
