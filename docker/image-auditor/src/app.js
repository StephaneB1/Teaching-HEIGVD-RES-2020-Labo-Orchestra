
var protocol = require('./auditor_protocol')
// Standard NodeJS module to work with UDP
const dgram = require('dgram');
// TCP server
var net = require('net');
// Date manipulation
var moment = require('moment'); 
moment.defaultFormat = 'YYYY-MM-DDTHH:mm:ss.SSS';

// Active musicians
var musicians = [];

// socket to listen for datagrams published in the multicast group of Musicians
const s = dgram.createSocket('udp4');

// Server for TCP client
var server = net.createServer(function(socket) {
	var payload = "[";
	for(var musician in musicians) {
		payload += "{" + musician.getJson() + "},";
	}
	payload += "]"

	// Put the payload in a buffer
	message = new Buffer(JSON.stringify(payload));

	socket.write(message + '\r\n');
	socket.pipe(socket);
});

server.listen(protocol.PROTOCOL_PORT);


s.bind(protocol.PROTOCOL_PORT, function() {
	s.addMembership(protocol.PROTOCOL_MULTICAST_ADDRESS);
});



// New connection detected
/*s.on('connect', function(msg, source) {
	console.log("New connection detected");
	var payload = "[";
	for(var musician in musicians) {
		payload += "{" + musician.getJson() + "},";
	}
	payload += "]"

	// Put the payload in a buffer
	message = new Buffer(JSON.stringify(payload));

	// Send the message to multicast addr
	s.send(message, 0, message.length, 
		protocol.PROTOCOL_PORT, protocol.PROTOCOL_MULTICAST_ADDRESS, 
		function(err, bytes){
			console.log("Sending payload : "  + payload + " via port " + s.address().port);
		});
});*/

// Server address information
/*s.on('listening', () => {
	const address = s.address();
	console.log(`server listening ${address.address}:${address.port}`);
});  */


// New datagram detected
s.on('message', function(msg, source) {

	var data = JSON.parse(msg);
  
	var newMusician = new Musician(data.uuid, data.instrument, data.activeSince);
	var isPresent = false;
	console.log("Message received from " + newMusician.id);

	for(var i = 0 ; i < musicians.length; i++) {
	  musician = musicians[i];
  
	  // Update activity time
	  if(musician.id == newMusician.id) {
		musician.activeSince = newMusician.activeSince;
		isPresent = true;
		break;
	  }
	}
  
	// Add the musician to the list if new
	if(isPresent == false) {
		console.log("New musician detected that plays : " + newMusician.instrument);
		musicians.push(newMusician);
	}
});

// Removing unwanted musicians every half-seconds 
var intervalID = setInterval(myCallback, 500);

function myCallback() {

	for(var i = 0 ; i < musicians.length; i++) {
		var now = moment().format();
		var diff = moment.utc(moment(now,"YYYY-MM-DDTHH:mm:ss.SSSZ").diff(moment(musicians[i].activeSince,"YYYY-MM-DDTHH:mm:ss.SSS"))).format("ss");

		// Removing if not active since more than 5 seconds
		if(diff >= 5) {
			musicians.splice(i, 1);
		}
	}
}

// Error handling
s.on('error', (err) => {
	console.log(`server error:\n${err.stack}`);
	server.close();
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