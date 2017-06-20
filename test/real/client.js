var nodeservice = require('./../../index');
var linkerService = new nodeservice.Client(require("./service"));
linkerService.inrunning.subscribe();
linkerService.inrunning.on('update', ()=>{
    //console.log('got update');
})
linkerService.inrunning.on('init', ()=>{
    console.log('got init');
})