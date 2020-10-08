document.addEventListener("DOMContentLoaded", function() {
    var color = '#'+(Math.random()*0xFFFFFF<<0).toString(16);
    var mouse = {
        click: false,
        move: false,
        pos: {x:0, y:0},
        pos_prev: false
    };

    // Obtenemos el canvas y creamos el contexto
    var canvas  = document.getElementById('drawing');
    var context = canvas.getContext('2d');
    var width   =  window.innerWidth * 0.45;
    var height  = window.innerHeight * 0.65;
    var socket  = io.connect();

    // Obtenemos la dimension del canvas
    canvas.width = width;
    canvas.height = height;

    // Registramos los movimientos del mouse
    canvas.onmousedown = function(e){ mouse.click = true; };
    canvas.onmouseup = function(e){ mouse.click = false; };

    function getMousePos(canvas, evt) {
        var rect = canvas.getBoundingClientRect();
        return {
            x: (evt.clientX - rect.left) / canvas.width,
            y: (evt.clientY - rect.top) / canvas.height
        };
    }

    canvas.onmousemove = function(e) {
        // normalizamos la posicion  0.0 - 1.0
        mouse.pos = getMousePos(canvas, e);
        mouse.move = true;
    };

    document.getElementById('clear_button').addEventListener("click",function(){
        socket.emit('clear_canvas');
    });


    // Pintamos en el canvas
    socket.on('draw_line', function (data) {
        var line = data.line;
        context.beginPath();
        context.moveTo(line[1].x * canvas.width, line[1].y *  canvas.height );
        context.lineTo(line[0].x * canvas.width, line[0].y * canvas.height );
        context.strokeStyle=data.color;
        context.lineWidth = 2;
        context.stroke();
    });

    socket.on('clear_canvas', function(){
        context.clearRect(0, 0, canvas.width, canvas.height);
    });


    //Descarga la imagen
    const btnDownload = document.getElementById('download');
    btnDownload.addEventListener('click',function(){
        const a = document.createElement('a');
        document.body.appendChild(a);
        a.href = document.getElementById('drawing').toDataURL();
        a.download = 'image.png';
        a.click();
        document.body.removeChild(a);
    })




    // main loop metodo recursivo cada 25 mili
    function mainLoop() {
        // Verificamos que este dibujando
        if (mouse.click && mouse.move && mouse.pos_prev) {
            // Enviamos la linea al servidor
            socket.emit('draw_line', { line: [ mouse.pos, mouse.pos_prev ], color: color });
            mouse.move = false;
        }
        mouse.pos_prev = {x: mouse.pos.x, y: mouse.pos.y};
        setTimeout(mainLoop, 25);
    }
    mainLoop();
});