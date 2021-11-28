import {
  decodeProxyCredentials,
  getHostPortFromString,
  readCredentials,
} from './utils'
import { statusCodes } from './config'
import httpProxy from 'http-proxy'
import http from 'http'
import url from 'url'
import net from 'net'

const run = async () => {
  const PORT = 8080

  const credentials = await readCredentials()

  //http Proxy
  const server = http
    .createServer((req: any, res) => {
      const urlObj = url.parse(req.url)
      const target = urlObj.protocol + '//' + urlObj.host
      console.log('Proxy HTTP request for:', target)
      const proxy = httpProxy.createProxyServer({})
      proxy.on('error', (err) => console.log('proxy error', err))
      proxy.web(req, res, { target })
    })
    .listen(PORT, () => console.log(`Server started on port ${PORT}`))

  server.addListener(statusCodes.connect, (req, socket, bodyhead) => {
    const proxyAuth: string | null = req.headers['proxy-authorization']

    if (!proxyAuth) {
      socket.write(
        'HTTP/1.1 407 Proxy Authentication Required\r\nProxy-Authenticate: Basic realm="Access to the internal site"\r\n\r\n'
      )

      socket.end()

      return
    }

    const { username, pass } = decodeProxyCredentials(proxyAuth)

    if (username !== credentials.login) {
      socket.write(
        'HTTP/1.1 407 Proxy Authentication Required\r\nProxy-Authenticate: Basic realm="Access to the internal site"\r\n\r\n'
      )

      socket.end()
      return
    }

    if (pass !== credentials.pass) {
      socket.write(
        'HTTP/1.1 407 Proxy Authentication Required\r\nProxy-Authenticate: Basic realm="Access to the internal site"\r\n\r\n'
      )
      socket.end()

      return
    }

    const hostPort = getHostPortFromString(req.url, 443)
    const hostDomain = hostPort[0]
    const port = parseInt(hostPort[1].toString())
    console.log('Proxying HTTPS request for:', hostDomain, port)

    const proxySocket = new net.Socket()
    proxySocket.connect(port, hostDomain.toString(), () => {
      proxySocket.write(bodyhead)
      socket.write(
        'HTTP/' + req.httpVersion + ' 200 Connection established\r\n\r\n'
      )
    })

    proxySocket.on(statusCodes.data, (chunk) => socket.write(chunk))
    proxySocket.on(statusCodes.end, () => socket.end())
    proxySocket.on(statusCodes.error, () => {
      socket.write('HTTP/' + req.httpVersion + ' 500 Connection error\r\n\r\n')
      socket.end()
    })

    socket.on(statusCodes.data, (chunk: Buffer) => {
      proxySocket.write(chunk)
    })
    socket.on(statusCodes.end, () => proxySocket.end())
    socket.on(statusCodes.error, () => proxySocket.end())
  })
}

run()
