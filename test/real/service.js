
var reportLinkableSchema = {
    type: 'object',
    properties:{
        provider: {
            type: 'string',
            eq: ['bet365','ladbrokes','mollybet','pinnacle','runningball','betfair','williamhill','threeEt', 'statscore', "bwin"]
        },
        id: {
            type: 'string' // String because of mollybet
        },
        data: {
            type: 'object',
            properties: {
                home: {type: 'string'},
                away: {type: 'string'},
                league: {type: 'string'},
                start_time: {type: 'date'}
            }
        }
    }
};

var reportRunningSchema = {
    type: 'object',
    properties: {
        provider: {
            type: 'string',
            eq: ['bet365','ladbrokes','mollybet','pinnacle','runningball','betfair','williamhill','threeEt', 'statscore', "bwin"]
        },
        id: {
            type: 'string'
        }
    }
};


var InrunningSchema = {
    type: 'object',
    strict: true,
    properties:{
        '*': {
            type: 'object',
            optional: true,
            properties:{
                ladbrokes_id: {type: 'number', optional: true},
                bet365_id: {type: 'number', optional: true},
                mollybet_id: {type: 'string', optional: true},
                runningball_id: {type: 'number', optional: true},
                pinnacle_id: {type: 'number', optional: true},
                betfair_id: {type: 'number', optional: true},
                williamhill_id: {type: 'number', optional: true},
                threeEt_id: {type: 'number', optional: true},
                statscore_id: {type: 'number', optional: true},
                bwin_id: {type: 'number', optional: true}
            }
        }
    }
};

var requestGetLinkedSchema = {
    type: 'object',
    properties:{
        glob_id: {
            type: 'number'
        }
    }
};

var replyGetLinkedSchema = {
    type: 'object',
    properties:{
    }
};

var descriptor = {
    transports: {
        source: {
            client: "tcp://127.0.0.1:13007",
            server: "tcp://127.0.0.1:13007"
        },
        sink: {
            client: "tcp://127.0.0.1:13008",
            server: "tcp://127.0.0.1:13008"
        },
        rpc: {
            client: "tcp://127.0.0.1:13009",
            server: "tcp://127.0.0.1:13009"
        }
    },
    endpoints: [
        {
            name: 'inrunning',
            type: 'SharedObject',
            objectSchema: InrunningSchema
        }
    ]
};

module.exports = descriptor;