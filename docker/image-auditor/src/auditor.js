
// Standard NodeJS module to work with UDP
const dgram = require('dgram');
// Date manipulation
var moment = require('moment'); 
moment.defaultFormat = 'YYYY-MM-DDTHH:mm:ss.SSSZ';

// Protocol values
var protocol = {
	PORT: 			   "2205",
	MULTICAST_ADDRESS: "239.255.22.5"
}

// Map of instruments
var instruments = new Map();
instruments.set("ti-ta-ti", "piano");
instruments.set("pouet", "trumpet");
instruments.set("trulu", "flute");
instruments.set("gzi-gzi", "violon");
instruments.set("boum-boum", "drum");


// socket to listen for datagrams published in the multicast group of Musicians
const s = dgram.createSocket('udp4');

s.bind(protocol.PORT, function() {
	console.log("Joining multicast group");
	s.addMembership(protocol.MULTICAST_ADDRESS);
});

// New datagram detected
s.on('message', function(msg, source) {
	console.log("Data has arrived: " + msg + ". Source IP: " + source.address + ". Source port: " + source.port);
});