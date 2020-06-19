var protocol = require('./musician_protocol')
const dgram = require('dgram');
const { v4: uuidv4 } = require('uuid');


var s = dgram.createSocket('udp4');

const instrumentMap = {
    'piano' : 'ti-ta-ti',
    'trumpet' : 'pouet',
    'flute' : 'trulu',
    'violin' : 'gzi-gzi',
    'drum' : 'boum-boum'
}

function Musician(instrumentRequest){

    // Create the unique uuid
    this.uuid = uuidv4();

    Musician.prototype.update = function(){
        
        var time = new Date()

        // Create data to send
        var data = {
            uuid : this.uuid,
            instrument : instrumentRequest,
            sound : instrumentMap[instrumentRequest],
            activeSince : time.toJSON()
        }

        // Transform the date into JSON format
        payload = JSON.stringify(data);

        // Put the payload in a buffer
        message = new Buffer(payload);

        // Send the message to multicast addr
        s.send(message, 0, message.length, 
            protocol.PROTOCOL_PORT, protocol.PROTOCOL_MULTICAST_ADDRESS, 
            function(err, bytes){
                console.log("Sending payload : "  + payload + " via port " + s.address().port);
            });
    }

    // Do this every second
    setInterval(this.update.bind(this),1000);
}


var m = new Musician(process.argv[2]);


