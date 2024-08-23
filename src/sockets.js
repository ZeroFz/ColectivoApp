
module.exports = (io) => {
    io.on('connection', (socket) => {
        console.log('User connected');

        socket.on('userCoordinates', coords => {
            console.log(coords)
            socket.broadcast.emit('newUserCoordinates', coords);
        });

        socket.on('disconnect', () => {
            console.log('User disconnected');
        });
    });
};