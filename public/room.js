const socket = io('/')
const myPeer = new Peer(undefined, {
    host: '/',
    port: '3001',
    path: 'mypeer'
});

const peers = {};
const videoGrid = document.getElementById('container');

const urlParams = new URLSearchParams(window.location.search);
const ROOM_ID = urlParams.get('roomid');

myPeer.on('open', id => {
    socket.emit('join-room', ROOM_ID, id)
})

myPeer.on('call', call => {
    call.answer()
    const video = document.getElementById('video')
    call.on('stream', userVideoStream => {
        addVideoStream(video, userVideoStream)
    })
})

function addVideoStream(video, stream) {
    video.srcObject = stream
    video.addEventListener('loadedmetadata', () => {
        video.play()
    })

}