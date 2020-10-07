//requires
const express = require('express');
const http = require('http');
const fs = require('fs');
const socketIO = require('socket.io');
//get server ip and port synchro
const serverConfig = JSON.parse(fs.readFileSync(__dirname +'/config/server.json','utf8'));




//Initialitation
const app = express();
//Creo el server con socket.io
const server = http.createServer(app);
//Obtengo la conexion
const io = socketIO(server);

//Create routes
require('./router')(app);
// Static content (css, js, .png, etc) is placed in /public
app.use(express.static(__dirname + '/public'));
// Location of our views
app.set('views',__dirname + '/views');

// Use ejs as our rendering engine
app.set('view engine', 'ejs');

// Tell Server that we are actually rendering HTML files through EJS.
app.engine('html', require('ejs').renderFile);

//Settings
app.set('port',process.env.PORT || 3000);

//Mando la conexion del Socket a socket.js que es el servidor


//Starting the server
server.listen(app.get('port'), () => {
    console.log('Server iniciado en el puerto 3000');
});



// array of all lines drawn
var line_history = [];
var notes;
var notes_taken = 0;


// event-handler for new incoming connections
io.on('connection', function (socket) {

    // first send the history to the new client and old notess
    for (var i in line_history) {
        socket.emit('draw_line', line_history[i] );
    }
    socket.emit('startup', { notes: notes, notes_taken: notes_taken });

    // add handler for message type "draw_line".
    socket.on('draw_line', function (data) {
        // add received line to history
        line_history.push(data);
        // send line to all clients
        io.emit('draw_line', data);
    });

    socket.on('clear_canvas', function(){
        line_history = [];
        io.emit('clear_canvas');
    });

    socket.on('notes_taken', function(uid){
        if(notes_taken === 0){
            notes_taken = 1;
            io.emit('notes_taken', uid);
        }
    });

    socket.on('notes_free', function(){
        if(notes_taken === 1){
            notes_taken = 0;
            io.emit('notes_free');
        }
    });

    socket.on('notes_content', function(data){
        notes = data.notes;
        io.emit('notes_content', data);
    })

});