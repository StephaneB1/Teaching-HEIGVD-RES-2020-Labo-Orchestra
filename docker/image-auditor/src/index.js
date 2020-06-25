var express = require('express');
var app = express();

var gs = require('./randomGenerator.js')

// If GET and tager resources is a '/', we execute the callback
app.get('/', function(req, res){
    res.send(gs.generateRandomArray(5,1,50));
});

// Listen at port 3000
app.listen(3000, function(){
    console.log('Acception resuqueste on port 3000');
});

