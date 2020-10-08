//requires
const express = require('express');
const http = require('http');
const fs = require('fs');
const socketIO = require('socket.io');

//Inicializacion
const app = express();
//Creo el server con http
const server = http.createServer(app);
//Obtengo la conexion
const io = socketIO(server);

//Creacion de rutas estaticas
require('./router')(app);
// carpeta que contiene los archivos publicos
app.use(express.static(__dirname + '/public'));
// Localizacion de las vistas
app.set('views',__dirname + '/views');

// Uso de ejs como el motor de vista
app.set('view engine', 'ejs');

// Le decimos al servidor que usaremos ejs en vez de html
app.engine('html', require('ejs').renderFile);

//Settings
app.set('port',process.env.PORT || 3000);

//Mando la conexion del Socket a socket.js que es el servidor


//Starting the server
server.listen(app.get('port'), () => {
    console.log('Server iniciado en el puerto 3000');
});

//hola mundo

// array de todas las lineas de dibujo
var line_history = [];
var notes;
var notes_taken = 0;


// Evento que captura una nueva conexion al socket
io.on('connection', function (socket) {

    // Primero le enviamos al usuario los trazos y el chat
    for (var i in line_history) {
        socket.emit('draw_line', line_history[i] );
    }
    socket.emit('startup', { notes: notes, notes_taken: notes_taken });

    // Mandamos un nuevo trazo
    socket.on('draw_line', function (data) {
        // recibimos el historial de trazos
        line_history.push(data);
        // mandamos todos
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