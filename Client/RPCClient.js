"use strict";

var http = require('http');
var doValidation = require("../misc/Validation").RPCValidation;

class RPCClient {
    constructor(endpoint, transports) {
        this.transport = transports.rpc;
        this.endpoint = endpoint;
        if (!this.transport)
            throw "Trying to initialise an RPC service without RPC config!";
    }

    call(input, timeout, callback) {
        if (!callback) { // Make compatible with old code
            callback = timeout;
            timeout = 10e3;
        }

        doValidation(this.endpoint, 'input', input);
        var answer_received = false;
        var answer_timeout = setTimeout(() => {
            if (!answer_received)
                callback('timeout');
            callback = null;
            answer_received = null;
        }, timeout);
        var postData = JSON.stringify({
            endpoint: this.endpoint.name,
            input: JSON.stringify(input)
        });
        var options = {
            hostname: this.transport.hostname,
            port: this.transport.port,
            path: '/',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            }
        };
        var req = http.request(options, (answer) => {
            answer_received = true;
            clearTimeout(answer_timeout);
            answer_timeout = null;
            var body = "";
            req.on('data', function (data) {
                body += data;
                console.log("Partial body: " + body);
            });
            var self = this;
            req.on('end', function () {
                var answer = JSON.parse(body);

                if (!answer.err)
                    doValidation(this.endpoint, 'output', answer.res);
                if (callback) callback(answer.err, answer.res);
            });
        });

        req.on('error', (e) => {
            console.error(`problem with request: ${e.message}`);
            answer_received = true;
            clearTimeout(answer_timeout);
            answer_timeout = null;

            callback(e.message)
        });
        req.write(postData);
        req.end();
    }

    handleRpcReply(req) {

    }
}

module.exports = RPCClient;

