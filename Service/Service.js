"use strict";

var zmq = require("zeromq");
var axon = require("axon");

var RPCService = require("./RPCService");
var SourceService = require("./SourceService");
var SharedObjectService = require("./SharedObjectService");
var PushService = require("./PushService");
var SinkService = require("./SinkService");

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
                case 'pushpull':
                    this._setupPushPull(this.descriptor.transports.pushpull.server);
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
        this._setupHeartbeat();
    }

    _setupHeartbeat(){
        setInterval(this._sendHeartbeat.bind(this), 5 * 1000);
    }

    _sendHeartbeat(){
        var OTW = {
            endpoint: '_heartbeat',
            time: new Date()
        };
        //console.log(new Date().toString(), 'Sending heartbeat');
        this.transports.source.send([OTW.endpoint, JSON.stringify(OTW)]);
    }

    _setupSink(hostname){
        var sock = new zmq.socket('pull');
        this.transports.sink = sock;

        sock.bindSync(hostname);
        sock.on('message', this._sinkCallback.bind(this));
    }

    _sinkCallback(message){
        if (!this.SinkEndpoint){
            throw new Error("Got a pull message, but ot Pull enpoint is connected!");
        }
        this.SinkEndpoint._processMessage(JSON.parse(message));
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

    _setupPushPull(hostname){
        var sock = new zmq.socket('push');
        sock.bindSync(hostname);
        this.transports.pushpull = sock;
    }

    _setupEndpoints(){
        this.RPCServices = {};

        for(let endpoint of this.descriptor.endpoints){
            switch(endpoint.type){
                case 'RPC':
                    var handler = this.handlers[endpoint.name];
                    if (!handler)
                        throw "Missing handler: " + endpoint.name;
                    this.RPCServices[endpoint.name] = new RPCService(endpoint, handler);
                    break;
                case 'Source':
                    this[endpoint.name] = new SourceService(endpoint, this.transports);
                    break;
                case 'SharedObject':
                    this[endpoint.name] = new SharedObjectService(endpoint, this.transports, this.initials[endpoint.name]);
                    break;
                case 'PushPull':
                    this[endpoint.name] = new PushService(endpoint, this.transports);
                    break;
                case 'Sink':
                    this[endpoint.name] = new SinkService(endpoint, this.transports);
                    this.SinkEndpoint = this[endpoint.name];
                    break;
                default:
                    throw "Unknown endpoint type";
            }
        }
    }
}

module.exports = Service;