const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 4000;

app.use(express.static(path.join(__dirname, 'public')));
app.get('/favicon.ico', (req, res) => res.status(204).end());

const server = app.listen(port, () => {
    console.log(`Server running on port ${port}`);
})

//initialize socket.io server
const io = require('socket.io')(server);
let socketConnected = new Set();


io.on('connection',(socket)=>{
    console.log('New user connected @ ' + socket.id);
    socketConnected.add(socket.id)

    io.emit('clients-total', socketConnected.size)

    socket.on('disconnect', () => {
        console.log('User disconnected @ ' + socket.id);
        socketConnected.delete(socket.id);

        io.emit('clients-total', socketConnected.size)
    });


    //listen for incoming chat message
    socket.on('message', (data)=>{
        // console.log(data);
        socket.broadcast.emit('chat-message', data)
    })

    //listen for typing feedback
    socket.on('feedback', (data) => {
        socket.broadcast.emit('feedback', data)
    })

})