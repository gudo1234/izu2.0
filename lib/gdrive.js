/*import { join } from 'path'
import { promises as fs } from 'fs'
import { promisify } from 'util'
import { google } from 'googleapis'

const SCOPES = ['https://www.googleapis.com/auth/drive.metadata.readonly']

const TOKEN_PATH = join(__dirname, '..', 'token.json')

class GoogleAuth extends EventEmitter {
  constructor() {
    super()
  }

  async authorize(credentials) {
    let token
    const { client_secret, client_id } = credentials
    const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, `http://localhost:${port}`)
    try {
      token = JSON.parse(await fs.readFile(TOKEN_PATH))
    } catch (e) {
      const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES
      })
      this.emit('auth', authUrl)
      let code = await promisify(this.once).bind(this)('token')
      token = await oAuth2Client.getToken(code)
      await fs.writeFile(TOKEN_PATH, JSON.stringify(token))
    } finally {
      await oAuth2Client.setCredentials(token)
    }
  }

  token(code) {
    this.emit('token', code)
  }
}

class GoogleDrive extends GoogleAuth {
  constructor() {
    super()
    this.path = '/drive/api'
  }

  async getFolderID(path) {

  }

  async infoFile(path) {

  }

  async folderList(path) {

  }

  async downloadFile(path) {

  }

  async uploadFile(path) {

  }
}

export  { GoogleAuth GoogleDrive }*/

/*import { join } from 'path'
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
  }
  async infoFile(path) {
  }
  async folderList(path) {
  }
  async downloadFile(path) {
  }
  async uploadFile(path) {
  }
}

export { GoogleAuth, GoogleDrive }*/
