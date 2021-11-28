import { resolve } from 'path'
import { statusCodestype } from './interfaces'

const credentialsPath = resolve(__dirname, '..', 'credentials.json')

const statusCodes: statusCodestype = {
  data: 'data',
  end: 'end',
  error: 'error',
  connect: 'connect',
}

export { credentialsPath, statusCodes }
