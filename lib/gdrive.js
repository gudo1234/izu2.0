import { join } from 'path'
import { promises as fs } from 'fs'
import { promisify } from 'util'
import { google } from 'googleapis'
import { EventEmitter } from 'events' // <-- Importante
const SCOPES = ['https://www.googleapis.com/auth/drive.metadata.readonly']
const TOKEN_PATH = join(__dirname, '..', 'token.json')
const DEFAULT_PORT = 3000 // <-- Asegura un valor para el puerto

class GoogleAuth extends EventEmitter {
  constructor(port = DEFAULT_PORT) {
    super()
    this.port = port
  }

  async authorize(credentials) {
    const { client_secret, client_id } = credentials
    const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, `http://localhost:${this.port}`)
    let token

    try {
      const tokenData = await fs.readFile(TOKEN_PATH, 'utf8')
      token = JSON.parse(tokenData)
    } catch (e) {
      const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES
      })
      this.emit('auth', authUrl)

      const getTokenOnce = promisify(this.once).bind(this)
      const code = await getTokenOnce('token')

      const { tokens } = await oAuth2Client.getToken(code)
      token = tokens

      await fs.writeFile(TOKEN_PATH, JSON.stringify(token))
    }

    oAuth2Client.setCredentials(token)
    this.authClient = oAuth2Client // Guarda la instancia para otros usos
  }

  token(code) {
    this.emit('token', code)
  }
}

class GoogleDrive extends GoogleAuth {
  constructor(port) {
    super(port)
    this.path = '/drive/api'
  }

  async getFolderID(path) {
    // Implementar lógica aquí
  }

  async infoFile(path) {
    // Implementar lógica aquí
  }

  async folderList(path) {
    // Implementar lógica aquí
  }

  async downloadFile(path) {
    // Implementar lógica aquí
  }

  async uploadFile(path) {
    // Implementar lógica aquí
  }
}

export { GoogleAuth, GoogleDrive }
