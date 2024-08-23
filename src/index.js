const express = require('express');
const engine = require('ejs-mate');
const path = require('path');
const socketIO = require('socket.io');
const http = require('http');


// Inicializadores
const app = express();
const server = http.createServer(app);
const io = socketIO(server);

// Configuración de EJS
app.engine('ejs', engine);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Rutas
app.get('/', (req, res) => {
    res.render('index');
});
app.use(express.static(path.join(__dirname, 'public')));

// Sockets
require('./sockets')(io);

// Server inicio
server.listen(3000, () => {
    console.log('Server running in port 3000');
});