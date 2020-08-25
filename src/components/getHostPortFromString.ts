const regex_hostport = /^([^:]+)(:([0-9]+))?$/

const getHostPortFromString = (hostString: string, defaultPort: number) => {
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

export {getHostPortFromString}
