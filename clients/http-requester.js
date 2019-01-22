const axios = require('axios');

class HTTPRequester {

    constructor(connection) {
        Object.defineProperty(this, 'connection', {
            value: connection,
            writable: false
        });
    }

    async executePOSTRequest(route, data) {
        return executeRequest(this.connection, "POST", route, data);
    }

    async executeGETRequest(route) {
        return executeRequest(this.connection, "GET", route);
    }

    async executePUTRequest(route, data) {
        return executeRequest(this.connection, "PUT", route, data);
    }

    async executePATCHRequest(route, data) {
        return executeRequest(this.connection, "PATCH", route, data);
    }

    async executeDELETERequest(route) {
        return executeRequest(this.connection, "DELETE", route);
    }
}

async function executeRequest(connection, method, route, data = "") {
    try {
        return await axios({
            method: method,
            url: `${connection.environment}${route}`,
            headers: {
                "Content-Type": "application/json",
                "Cache-Control": "no-cache",
                "Authorization": connection.authorization
            },
            data: data
        });
    } catch (error) {
        if (error.response && error.response.data) {
            throw error.response.data;
        } else {
            throw error;
        } 
    }
}

module.exports = HTTPRequester;
