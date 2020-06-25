
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
var server = net.createServer();

server.listen(2205);

server.on('connection', function(socket){
	var payload = "[";
	for(var i = 0 ; i < musicians.length; i++) {
		musician = musicians[i];
		if(i !=0){
			payload += ",";
		}
		payload += JSON.stringify(musician.getJson());
	}
	payload += "]";

	// Put the payload in a buffer
	message = new Buffer(payload);

	socket.write(message + '\n');
	socket.end();
})



s.bind(protocol.PROTOCOL_PORT, function() {
	s.addMembership(protocol.PROTOCOL_MULTICAST_ADDRESS);
});


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
function Musician(id, instrument, activeSince) {
	
	  this.id = id;
	  this.instrument = instrument;
	  this.activeSince = activeSince;

	 this.getJson = function() {
		var data = {
			uuid : this.id,
			instrument : this.instrument,
			activeSince : this.activeSince
		}
	
		console.log("getJson "+JSON.stringify(data));
	
		return JSON.stringify(data);
	}
	
}

