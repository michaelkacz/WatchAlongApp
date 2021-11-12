const $self = {
  /* common start */
  rtcConfig: null,
  mediaConstraints: { audio: true, video: true },
  /* common end */

  /* David start */

  /* David end */

  /*  Michael start */

  /*  Michael end */

  /* Chiachi start */

  /* Chiachi end */
};

// For storing user video peers
const $peers = {

};

// For storing chat peers
const $chatPeers = {

};

// For storing video control peers
const $videoControlPeers = {

};

/** Signaling-Channel Setup **/
const namespace = prepareNamespace(window.location.hash, true);

const sc = io.connect('/' + namespace, { autoConnect: false });

registerChannelEvents();
sc.open();

// Signaling Channel Events
function registerChannelEvents() {
  sc.on('connect', handleChannelConnect);
  sc.on('connected peers', handleChannelConnectedPeers);
  sc.on('connected peer', handleChannelConnectedPeer);
  sc.on('signal', handleChannelSignal);
  sc.on('disconnected peer', handleChannelDisconnectedPeer);
}

function handleChannelConnect() {
  console.log('Connected to signaling server!');
  $self.id = sc.id;
  console.log(`Self ID: ${$self.id}`);
}

function handleChannelConnectedPeers(ids) {
  console.log(`Connected peer IDs: ${ids.join(', ')}`);
}

function handleChannelConnectedPeer(id) {
  console.log(`ID of the new coming peer: ${id}`);
}

function handleChannelDisconnectedPeer(id) {
  console.log(`Disconnected peer ID: ${id}`);
}

function handleChannelSignal(data) {
  console.log(`Signal:`, data);
}

/**
David start
*/



/**
David end
*/



/**
Michael start
*/



/**
Michael end
*/



/**
Chiachi start
*/
// TODO get vidoe id from the room settings
const videoId = 'npUlUdeU1vc';

const iframeAPIScript = document.createElement('script');
iframeAPIScript.src = 'https://www.youtube.com/iframe_api';
document.getElementsByTagName('body')[0].append(iframeAPIScript);

const playerDom = document.getElementById('player');
let player;
// This will be executed after the YouTubeIframeAPI is loaded.
function onYouTubeIframeAPIReady() {
  player = new YT.Player('player', {
    height: playerDom.clientWidth * 0.5625,
    width: playerDom.clientWidth,
    videoId,
    playerVars: {
      modestbranding: 1,
      controls: 0,
      playsinline: 1
    },
    events: {
      onReady: onPlayerReady,
      onStateChange: onPlayerStateChange
    }
  });
}

// This will be called when the video player is ready.
function onPlayerReady(event) {
  console.log('ready...');
}

// The will be called when the player's state changes.
function onPlayerStateChange(event) {
  // TODO send command to everyone
  console.log(event.data);
}

function startVideo() {
  // TODO send start command to everyone
  player.playVideo();
}

function pauseVideo() {
  // TODO send pause command to everyone
  player.pauseVideo();
}

function stopVideo() {
  // TODO send stop command to everyone
  player.stopVideo();
}

document.getElementById('play-video').addEventListener('click', startVideo);
document.getElementById('pause-video').addEventListener('click', pauseVideo);
document.getElementById('stop-video').addEventListener('click', stopVideo);


/**
Chiachi end
*/
