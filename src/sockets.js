let contador_de_refresh = 0;
module.exports = (io) => {
    io.on('connection', (socket) => {
        console.log('User connected');

        socket.on('userCoordinates', coords => {
            const { lat, lng } = coords;
            console.log('Latitud:', lat + " " + 'Longitud:', lng);
            console.log('Refresh server nro: ' + contador_de_refresh); //console.log al servidor
            socket.broadcast.emit('newUserCoordinates', coords);
            contador_de_refresh = contador_de_refresh + 1;
        });

        socket.on('disconnect', () => {
            console.log('User disconnected');
        });
    });
};