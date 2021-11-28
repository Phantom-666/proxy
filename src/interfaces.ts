interface ICredentials {
  login: string
  pass: string
}
type statusCodestype = {
  data: string
  end: string
  error: string
  connect: string
}

export { ICredentials, statusCodestype }
