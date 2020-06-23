
// Standard NodeJS module to work with UDP
const dgram = require('dgram');
// Date manipulation
var moment = require('moment'); 
moment.defaultFormat = 'YYYY-MM-DDTHH:mm:ss.SSS';

// Protocol values
var protocol = {
	PORT: 			   2205,
	MULTICAST_ADDRESS: "239.255.22.5"
};

// Active musicians
var musicians = [];

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
	s.addMembership(protocol.MULTICAST_ADDRESS);
});

// New connection detected
s.on('connect', function(msg, source) {
	var payload = "[";
	for(var musician in musicians) {
		payload += "{" + musician.getJson() + "},";
	}
	payload += "]"

	// Put the payload in a buffer
	message = new Buffer(JSON.stringify(payload));

	// Send the message to multicast addr
	s.send(message, 0, message.length, 
		protocol.PORT, protocol.MULTICAST_ADDRESS, 
		function(err, bytes){
			console.log("Sending payload : "  + payload + " via port " + s.address().port);
		});
});

// New datagram detected
s.on('message', function(msg, source) {

	var data = JSON.parse(msg);
	var newMusician = new Musician(data.id, data.instrument, data.activeSince);
	var isPresent = false;

	for(var musician in musicians) {
		// Replace the data of an already present musician
		if(musician.id == newMusician.id) {
			musician = newMusician;
			isPresent = true;
			break;
		}
	}

	// Add the musician to the list if new
	if(isPresent == false) {
		musicians.push(newMusician);
	}
});

// Musician class
class Musician {
	constructor(id, instrument, activeSince) {
	  this.id = id;
	  this.instrument = instrument;
	  this.activeSince = activeSince;
	}

	getJson() {
		var data = {
			uuid : this.id,
			instrument : this.instrument,
			activeSince : this.activeSince
		}

		return JSON.stringify(data);
	}
}