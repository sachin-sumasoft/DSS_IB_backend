function buildResponse(statusCode, body) {
    return {
        statusCode : statusCode,
        headers : {
            'Access-Control-Allow-Origin' : '*',
            'Control-Type' : 'application/json'
        },
        body: JSON.stringify(body)
    }
}
module.exports.buildResponse = buildResponse;