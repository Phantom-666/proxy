import {getHostPortFromString} from './components/getHostPortFromString'
import statusCodes from './statusNames'
import httpProxy from 'http-proxy'
import http from 'http'
import url from 'url'
import net from 'net'
const PORT = 8080 //This is the port your clients will connect to
const log = (...errors:any[]) => console.log(errors.join(' '))


//http Proxy
const server = http
  .createServer((req:any, res) => {
    const urlObj = url.parse(req.url)
    const target = urlObj.protocol + '//' + urlObj.host
    console.log('Proxy HTTP request for:', target)
    const proxy = httpProxy.createProxyServer({})
    proxy.on('error', err => log('proxy error', err))
    proxy.web(req, res, {target})
  })
  .listen(PORT, () => log(`Server started on port ${PORT}`))


server.addListener(statusCodes.connect, (req, socket, bodyhead) => {
  const hostPort = getHostPortFromString(req.url, 443)
  const hostDomain = hostPort[0]
  const port = parseInt(hostPort[1].toString())
  log('Proxying HTTPS request for:', hostDomain, port)

  const proxySocket = new net.Socket()
  proxySocket.connect(port, hostDomain.toString(), () => {
    proxySocket.write(bodyhead)
    socket.write('HTTP/' + req.httpVersion + ' 200 Connection established\r\n\r\n')
  })

  proxySocket.on(statusCodes.data, (chunk) => socket.write(chunk))
  proxySocket.on(statusCodes.end, () => socket.end())
  proxySocket.on(statusCodes.error, () => {
    socket.write('HTTP/' + req.httpVersion + ' 500 Connection error\r\n\r\n')
    socket.end()
  })

  socket.on(statusCodes.data, (chunk:any) => proxySocket.write(chunk))
  socket.on(statusCodes.end, () => proxySocket.end())
  socket.on(statusCodes.error, () => proxySocket.end())
})
