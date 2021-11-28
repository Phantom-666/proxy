import { readFile } from 'fs/promises'
import { resolve } from 'path'
import { credentialsPath } from './config'
import { ICredentials } from './interfaces'

const getHostPortFromString = (hostString: string, defaultPort: number) => {
  const regex_hostport = /^([^:]+)(:([0-9]+))?$/

  let host = hostString
  let port = defaultPort

  const result = regex_hostport.exec(hostString)
  if (result != null) {
    host = result[1]
    if (result[2] != null) {
      port = Number(result[3])
    }
  }

  return [host, port]
}

const readCredentials = async () => {
  const credentials = await readFile(resolve(credentialsPath), 'utf-8')

  const json: ICredentials = await JSON.parse(credentials)

  return json
}

const decodeProxyCredentials = (proxyAuth: string) => {
  const encoded = proxyAuth.split(' ')[1]

  const buff = Buffer.from(encoded, 'base64')

  const [username, pass] = buff.toString('utf-8').split(':')

  return { username, pass }
}

export { getHostPortFromString, readCredentials, decodeProxyCredentials }
