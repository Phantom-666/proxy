type statusCodestype = {
    data: string,
    end : string,
    error : string,
    connect : string
}

const statusCodes : statusCodestype = {
    data: 'data',
    end : 'end',
    error : 'error',
    connect : 'connect'
}

export default statusCodes