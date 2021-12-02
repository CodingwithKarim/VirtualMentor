const socket = io()
const {mentee, room} = Qs.parse(location.search, {
    ignoreQueryPrefix: true
})

socket.emit('join-room', {mentee, room})

socket.on('message', message=> {
    console.log(message)
} )