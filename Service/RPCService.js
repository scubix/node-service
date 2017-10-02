"use strict";

var doValidation = require("../misc/Validation").RPCValidation;

class RPCService{
    constructor(endpoint, handler){
        this.endpoint = endpoint;
        this.handler = handler;
        this.stats = {updates: 0};
    }

    call(data, callback){
        if (this.endpoint.name != data.endpoint)
            throw ("Wrong handler called!");

        doValidation(this.endpoint, 'input', data.input);
        this.stats.updates++;

        this.handler(data.input, (err, res) => {

            if (!err){
                doValidation(this.endpoint, 'output', res);
            }

            var reply = JSON.stringify({err,res});
            callback(reply);
        });
    }

    getStats(){
        var current_stats = JSON.parse(JSON.stringify(this.stats));
        this.stats.updates = 0;
        return current_stats;
    }
}

module.exports = RPCService;