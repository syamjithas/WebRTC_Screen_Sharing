
'use strict';



const recordButton = document.querySelector('button#record');
const startButton = document.querySelector('button#startButton');
const recordedVideo = document.querySelector('video#recorded');

let mediaRecorder;
let recordedBlobs;


const socket = io('/')
const myPeer = new Peer(undefined, {
  host: '/',
  port: '3001',
  path: 'mypeer'
})
const peers = {}


if (adapter.browserDetails.browser == 'firefox') {
  adapter.browserShim.shimGetDisplayMedia(window, 'screen');
}


function makeid(length) {
  var result = '';
  var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

const ROOM_ID = makeid(10)
const partial_url = '/static/room.html?roomid='
const room_ele = document.getElementById('room-url')
const full_url = location.origin + partial_url + ROOM_ID;
room_ele.innerHTML = full_url;
room_ele.addEventListener('click', function (event) {
  copyTextToClipboard(full_url);
});
function copyTextToClipboard(text) {
  navigator.clipboard.writeText(text).then(function () {
    console.log('Async: Copying to clipboard was successful!');
  }, function (err) {
    console.error('Async: Could not copy text: ', err);
  });
}

myPeer.on('open', id => {
  socket.emit('join-room', ROOM_ID, id)
})


function handleSuccess(stream) {
  startButton.disabled = true;
  const video = document.querySelector('video');
  video.srcObject = stream;

  recordButton.disabled = false;
  console.log('getUserMedia() got stream:', stream);
  window.stream = stream;

  stream.getVideoTracks()[0].addEventListener('ended', () => {
    errorMsg('The user has ended sharing the screen');
    recordButton.disabled = true;
    startButton.disabled = false;
  });


  socket.on('user-connected', userId => {
    connectToNewUser(userId)
  })
}



function handleError(error) {
  errorMsg(`getDisplayMedia error: ${error.name}`, error);
}

function errorMsg(msg, error) {
  if (typeof error !== 'undefined') {
    console.error(error);
  }
}

function connectToNewUser(userId) {
  const call = myPeer.call(userId, stream)
  peers[userId] = call
}

socket.on('user-disconnected', userId => {
  if (peers[userId]) peers[userId].close()
})


startButton.addEventListener('click', () => {
  navigator.mediaDevices.getDisplayMedia({ video: true })
    .then(handleSuccess, handleError);
});


if ((navigator.mediaDevices && 'getDisplayMedia' in navigator.mediaDevices)) {
  startButton.disabled = false;
} else {
  errorMsg('getDisplayMedia is not supported');
}
