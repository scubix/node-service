// Create a socket
var zmq = require('zmq');
var socket = zmq.socket('req');
var ssocket = zmq.socket('rep');

// Register to monitoring events
socket.on('connect', function(fd, ep) {console.log('connect, endpoint:', ep);});
socket.on('connect_delay', function(fd, ep) {console.log('connect_delay, endpoint:', ep);});
socket.on('connect_retry', function(fd, ep) {console.log('connect_retry, endpoint:', ep);});
socket.on('listen', function(fd, ep) {console.log('listen, endpoint:', ep);});
socket.on('bind_error', function(fd, ep) {console.log('bind_error, endpoint:', ep);});
socket.on('accept', function(fd, ep) {console.log('accept, endpoint:', ep);});
socket.on('accept_error', function(fd, ep) {console.log('accept_error, endpoint:', ep);});
socket.on('close', function(fd, ep) {console.log('close, endpoint:', ep);});
socket.on('close_error', function(fd, ep) {console.log('close_error, endpoint:', ep);});
socket.on('disconnect', function(fd, ep) {console.log('disconnect, endpoint:', ep);});

// Handle monitor error
socket.on('monitor_error', function(err) {
    console.log('Error in monitoring: %s, will restart monitoring in 5 seconds', err);
    setTimeout(function() { socket.monitor(500, 0); }, 5000);
});

// Call monitor, check for events every 500ms and get all available events.
console.log('Start monitoring...');
socket.monitor();
socket.connect('tcp://127.0.0.1:1234');
setTimeout(function () {
    ssocket.bind('tcp://127.0.0.1:1234');
},500)
setTimeout(function() {
    console.log('Stop the monitoring...');
    socket.unmonitor();
}, 20000);