var nodeservice = require('./../../index');
var descriptor = require('./service');

function randomWholeNum() {

  return Math.floor(Math.random() * (10000 - 1) + 1);
}
var service = new nodeservice.Service(descriptor, {}, {inrunning:{}});

setInterval(()=>{
    for(var i = 0; i < 33599;i++) {
        var keys = Object.keys(service.inrunning.data);
        service.inrunning.data[keys[0]] = {test: randomWholeNum()};
        var num = randomWholeNum();
        service.inrunning.data[num] = {test: randomWholeNum()}
        service.inrunning.notify([keys[0]]);
        service.inrunning.notify([num]);
        console.log('emit', keys.length)
    }
}, 7000);

function createRandomArr() {
    var arr = []
    var times = randomWholeNum();
    for(var i = 0; i++; i < times){
        arr.push(randomWholeNum())
    }
    return arr;
}
setInterval(()=> {
    var num = randomWholeNum();
    service.inrunning.data[5] = {test: createRandomArr(),
    num: 1}
    service.inrunning.data[5][num] = 5
    service.inrunning.notify([5]);
}, 10);