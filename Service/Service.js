"use strict";

var zmq = require("zmq");
var axon = require("axon");

var RPCService = require("./RPCService");
var SourceService = require("./SourceService");
var SharedObjectService = require("./SharedObjectService");

class Service {
    constructor(descriptor, handlers, initials){
        this.descriptor = descriptor;
        this.transports = {};
        this.handlers = handlers || {};
        this.initials = initials || {};

        this._setupTransports();
        this._setupEndpoints();
    }

    _setupTransports(){
        for(let transport in this.descriptor.transports){
            switch (transport){
                case 'source':
                    this._setupSource(this.descriptor.transports.source.server);
                    break;
                case 'sink':
                    this._setupSink(this.descriptor.transports.sink.server);
                    break;
                case 'rpc':
                    this._setupRpc(this.descriptor.transports.rpc.server);
                    break;
                default:
                    break;
            }
        }
    }

    _setupSource(hostname){
        var sock = new zmq.socket('pub');
        this.transports.source = sock;
        sock.bind(hostname);
    }

    _setupSink(hostname){
        var sock = new zmq.socket('sub');
        this.transports.sink = sock;
        sock.bindSync(hostname);
        sock.subscribe("");
        sock.on('message', this._sinkCallback.bind(this));
    }

    _sinkCallback(message){
        // TODO: pass message to eventemitter
    }

    _setupRpc(hostname){
        var sock = new axon.socket('rep');
        sock.bind(hostname);
        sock.on('message', this._rpcCallback.bind(this));
        this.transports.rpc = sock;
    }

    _rpcCallback(input, reply){
        var handler = this.RPCServices[input.endpoint];
        if (handler) // Could be SharedObject, has a different callback
            handler.call(input, reply);
    }

    _setupEndpoints(){
        this.RPCServices = {};

        for(let endpoint of this.descriptor.endpoints){
            switch(endpoint.type){
                case 'RPC':
                    var handler = this.handlers[endpoint.name];
                    if (!handler)
                        throw "Missing handler: " + name;
                    this.RPCServices[endpoint.name] = new RPCService(endpoint, handler);
                    break;
                case 'Source':
                    this[endpoint.name] = new SourceService(endpoint, this.transports);
                    break;
                case 'SharedObject':
                    this[endpoint.name] = new SharedObjectService(endpoint, this.transports, this.initials[endpoint.name]);
                    break;
                default:
                    throw "Unknown endpoint type";
            }
        }
    }
}

module.exports = Service;