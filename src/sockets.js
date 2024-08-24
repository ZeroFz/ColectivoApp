
module.exports = (io) => {
    io.on('connection', (socket) => {
        console.log('User connected');

        socket.on('userCoordinates', coords => {
            const { lat, lng } = coords;
            console.log('Latitud:', lat);
            console.log('Longitud:', lng);
            socket.broadcast.emit('newUserCoordinates', coords);
        });

        socket.on('disconnect', () => {
            console.log('User disconnected');
        });
    });
};