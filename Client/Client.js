"use strict";

var zmq = require("zmq");
var axon = require("axon");

var RPCClient = require("./RPCClient");
var SourceClient = require("./SourceClient");
var SharedObjectClient = require("./SharedObjectClient");
var PullClient = require("./PullClient");

class Client {
    constructor(descriptor, workers){
        if (!workers){
            workers = {}
        }

        this.workers = workers;
        this.descriptor = descriptor;
        this.transports = {};

        this._setupTransports();
        this._setupEndpoints();
    }

    _setupTransports(){
        for(let transport in this.descriptor.transports){
            switch (transport){
                case 'source':
                    this._setupSource(this.descriptor.transports.source.client);
                    break;
                case 'sink':
                    this._setupSink(this.descriptor.transports.sink.client);
                    break;
                case 'rpc':
                    this._setupRpc(this.descriptor.transports.rpc.client);
                    break;
                case 'pushpull':
                    this._setupPull();
                    break;
                default:
                    break;
            }
        }
    }

    _setupSource(hostname){
        var sock = new zmq.socket('sub');
        this.transports.source = sock;
        sock.connect(hostname);
        sock.on('message', this._sourceCallback.bind(this));
    }

    _setupSink(hostname){
        var sock = new zmq.socket('pub');
        this.transports.sink = sock;
        sock.connect(hostname);
    }

    _sourceCallback(endpoint, message){
        var data = JSON.parse(message);
        this[endpoint]._processMessage(data);
    }

    _setupRpc(hostname){
        var sock = new axon.socket('req');
        sock.connect(hostname);
        this.transports.rpc = sock;
    }

    _setupPull(hostname){
        var sock = new zmq.socket("pull");
        // DON'T CONNECT! Client must explicitly ask!
        sock.on('message', this._pullCallback.bind(this));
        this.transports.pushpull = sock;
    }

    _pullCallback(message){
        if (!this.PullEndpoint){
            throw new Error("Got a pull message, but ot Pull enpoint is connected!");
        }

        this.PullEndpoint._processMessage(JSON.parse(message));
    }

    _setupEndpoints(){
        for(let endpoint of this.descriptor.endpoints){
            switch(endpoint.type){
                case 'RPC':
                    this[endpoint.name] = new RPCClient(endpoint, this.transports);
                    break;
                case 'Source':
                    this[endpoint.name] = new SourceClient(endpoint, this.transports);
                    break;
                case 'SharedObject':
                    this[endpoint.name] = new SharedObjectClient(endpoint, this.transports);
                    this['_SO_'+endpoint.name] = this[endpoint.name];
                    break;
                case 'PushPull':
                    if (this.PullEndpoint){
                        throw new Error("Only a singly Pushpull endpoint can be constructed per service!");
                    }
                    this[endpoint.name] = new PullClient(endpoint, this.transports, this.descriptor.transports.pushpull.client);
                    this.PullEndpoint = this[endpoint.name];
                    break;
                default:
                    throw "Unknown endpoint type.";
            }
        }
    }
}

module.exports = Client;
