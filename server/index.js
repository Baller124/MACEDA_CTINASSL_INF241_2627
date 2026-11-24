import bcrypt from 'bcryptjs'
import express from 'express'
import mongoose from 'mongoose'
import { User } from './models/User.js'

const app = express()
const port = Number(process.env.PORT) || 3001
const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/urban_roll'

app.use(express.json({ limit: '10kb' }))

app.get('/api/health', (_request, response) => {
  response.json({
    status: 'ok',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
  })
})

app.post('/api/auth/register', async (request, response, next) => {
  const { username, email, password } = request.body ?? {}

  if (typeof username !== 'string' || typeof email !== 'string' || typeof password !== 'string') {
    response.status(400).json({ message: 'Username, email, and password are required.' })
    return
  }

  const normalizedUsername = username.trim().toLowerCase()
  const normalizedEmail = email.trim().toLowerCase()

  if (!/^[a-z0-9._-]{3,32}$/.test(normalizedUsername)) {
    response.status(400).json({ message: 'Username must be 3–32 characters and use letters, numbers, dots, underscores, or hyphens.' })
    return
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    response.status(400).json({ message: 'Enter a valid email address.' })
    return
  }

  if (password.length < 8 || Buffer.byteLength(password, 'utf8') > 72) {
    response.status(400).json({ message: 'Password must be at least 8 characters and no more than 72 UTF-8 bytes.' })
    return
  }

  try {
    const passwordHash = await bcrypt.hash(password, 12)
    const user = await User.create({
      username: normalizedUsername,
      email: normalizedEmail,
      passwordHash,
    })

    response.status(201).json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    })
  } catch (error) {
    if (error?.code === 11000) {
      const field = Object.keys(error.keyPattern ?? {})[0]
      response.status(409).json({
        message: field === 'email' ? 'An account with that email already exists.' : 'That username is already taken.',
      })
      return
    }

    next(error)
  }
})

app.post('/api/auth/login', async (request, response, next) => {
  const { identifier, password } = request.body ?? {}

  if (typeof identifier !== 'string' || typeof password !== 'string') {
    response.status(400).json({ message: 'Username/email and password are required.' })
    return
  }

  try {
    const normalizedIdentifier = identifier.trim().toLowerCase()
    const user = await User.findOne({
      $or: [{ username: normalizedIdentifier }, { email: normalizedIdentifier }],
    }).select('+passwordHash')

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      response.status(401).json({ message: 'That username/email and password do not match.' })
      return
    }

    response.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    })
  } catch (error) {
    next(error)
  }
})

app.use((error, _request, response, _next) => {
  if (error?.type === 'entity.parse.failed') {
    response.status(400).json({ message: 'Request body must be valid JSON.' })
    return
  }

  if (error?.type === 'entity.too.large') {
    response.status(413).json({ message: 'Request body is too large.' })
    return
  }

  console.error('API request failed:', error)
  response.status(500).json({ message: 'The server could not complete the request.' })
})

async function startServer() {
  await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 })
  await User.init()

  app.listen(port, '127.0.0.1', () => {
    console.log(`Urban Roll API listening at http://127.0.0.1:${port}`)
    console.log(`Connected to MongoDB database "${mongoose.connection.name}"`)
  })
}

startServer().catch((error) => {
  console.error('Could not start the Urban Roll API:', error)
  process.exitCode = 1
})
