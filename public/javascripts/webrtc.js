const VIDEO_CHAT = 'videoChat';
const TEXT_CHAT = 'textChat';
const VIDEO_CONTROL = 'videoControl';

const $self = {
  /* common start */
  rtcConfig: null,
  id: null,

  // computed property names
  [VIDEO_CHAT]: {
    // [peerId]: { isPolit, ... }
  },
  [TEXT_CHAT]: {
    // [peerId]: { isPolit, ... }
  },
  [VIDEO_CONTROL]: {
    // [peerId]: { isPolit, ... }
  },
  /* common end */

  /* David start */
  mediaConstraints: { audio: false, video: true },

  /* David end */

  /*  Michael start */

  /*  Michael end */

  /* Chiachi start */
  controlDCId: 99,
  videoId: 'npUlUdeU1vc',
  player: null,

  /* Chiachi end */
};


// For storing user video peers
const $peers = {
  [VIDEO_CHAT]: {
    // [peerId]: { connection, ... }
  },
  [TEXT_CHAT]: {
    // [peerId]: { connection, ... }
  },
  [VIDEO_CONTROL]: {
    // [peerId]: { connection, ... }
  },
};

/*
navigator.mediaDevices.getUserMedia($self.mediaConstraints).then((stream) => {
  $self.stream = stream;
});
*/

requestUserMedia($self.mediaConstraints);

/*
First page forms
*/
function handleUserNames(event) {
  event.preventDefault();
  const form = event.target;
  const username = form.querySelector('#username-input').value;
  const figcaption = document.querySelector('#self figcaption');
  figcaption.innerText = username;
}

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
  for (let id of ids) {
    if (id !== $self.id) {
      // $self is polite with already-connected peers
      initializeSelfAndPeerByIdAndType(VIDEO_CHAT, id, true);
      establishCallFeatures(id);

      initializeSelfAndPeerByIdAndType(TEXT_CHAT, id, true);
      establishTextChatFeatures(id);

      initializeSelfAndPeerByIdAndType(VIDEO_CONTROL, id, true);
      establishVideoControlFeatures(id);
    }
  }
}

function handleChannelConnectedPeer(id) {
  console.log(`ID of the new coming peer: ${id}`);
  // $self is impolite with each newly connecting peer
  initializeSelfAndPeerByIdAndType(VIDEO_CHAT, id, false);
  establishCallFeatures(id);

  initializeSelfAndPeerByIdAndType(TEXT_CHAT, id, false);
  establishTextChatFeatures(id);

  initializeSelfAndPeerByIdAndType(VIDEO_CONTROL, id, false);
  establishVideoControlFeatures(id);
}

function initializeSelfAndPeerByIdAndType(type, id, politeness) {
  $self[type][id] = {
    isPolite: politeness,
    isMakingOffer: false,
    isIgnoringOffer: false,
    isSettingRemoteAnswerPending: false
  };
  $peers[type][id] = { connection: new RTCPeerConnection($self.rtcConfig) };
}

function handleChannelDisconnectedPeer(id) {
  console.log(`Disconnected peer ID: ${id}`);
}

async function handleChannelSignal({ from, to, type, description, candidate, resend }) {
  console.log('Heard signal event!');
  const myself = $self[type][from];
  const peer = $peers[type][from];

  if (description) {
    console.log('Received SDP Signal:', description);
    const readyForOffer = !myself.isMakingOffer &&
        (peer.connection.signalingState === 'stable' || myself.isSettingRemoteAnswerPending);
    console.log('readyForOffer:', readyForOffer);

    const offerCollision = description.type === 'offer' && !readyForOffer;
    console.log('offerCollision:', offerCollision);

    myself.isIgnoringOffer = !myself.isPolite && offerCollision;
    console.log('isIgnoringOffer:', myself.isIgnoringOffer);

    if (myself.isIgnoringOffer) {
      return;
    }

    myself.isSettingRemoteAnswerPending = description.type === 'answer';
    try {
      await peer.connection.setRemoteDescription(description);
    } catch(e) {
      console.error('Cannot set remote description', e);
      if (!myself.isSettingRemoteAnswerPending && peer.connection.signalingState === 'have-local-offer') {
        // the browser (Safari) can't handle state conflict, so reset myself and tell remote end to send again
        // TODO reset connection
      }
      return;
    }
    myself.isSettingRemoteAnswerPending = false;

    if (description.type === 'offer') {
      try {
        await peer.connection.setLocalDescription();
      } catch(e) {
        const answer = await peer.connection.createAnswer();
        await peer.connection.setLocalDescription(answer);
      } finally {
        console.log('Send answer');
        sc.emit('signal', {
          from: $self.id,
          to: from,
          type,
          description: peer.connection.localDescription
        });
        myself.skipOffer = false;
      }
    }
  } else if (candidate) {
    console.log('Received ICE candidate:', candidate);
    try {
      await peer.connection.addIceCandidate(candidate);
    } catch(e) {
      if (!myself.isIgnoringOffer) {
        console.error('Cannot add ICE candidate for peer', e);
      }
    }
  } else if (resend) {
    console.log('Received resend signal');
    handleRtcNegotiation(type, from);
  }
}

/* WebRTC Events */
function registerRtcEvents(type, id, handler) {
  peer = $peers[type][id];

  peer.connection.onnegotiationneeded = () => handleRtcNegotiation(type, id);
  peer.connection.onicecandidate = ({ candidate }) => handleIceCandidate(type, id, candidate);

  if (type === VIDEO_CHAT) {
    peer.connection.ontrack = handleRtcPeerTrack(id);
  } else {
    // The rest of types are data channel event
    peer.connection.ondatachannel = ({ channel }) => handler(type, id, channel);
  }
}

async function handleRtcNegotiation(type, id) {
  const myself = $self[type][id];
  const peer = $peers[type][id];
  console.log('RTC negotiation needed...');
  if (myself.skipOffer) {
    console.log('Skip offer');
    return;
  }
  // send an SDP description
  myself.isMakingOffer = true;
  try {
    await peer.connection.setLocalDescription();
  } catch (e) {
    const offer = await peer.connection.createOffer();
    await peer.connection.setLocalDescription(offer);
  } finally {
    // finally, however this was done, send the localDescription to the remote peer
    console.log('Send description...');
    sc.emit('signal', {
      from: $self.id,
      to: id,
      type,
      description: peer.connection.localDescription
    });
  }
  myself.isMakingOffer = false;
}

function handleIceCandidate(type, id, candidate) {
  // send ICE candidate
  console.log('Send ICE candidate...');
  sc.emit('signal', {
    from: $self.id,
    to: id,
    type,
    candidate
  });
}

function handleRtcPeerTrack() {
  return function({ streams: [stream] }) {
  console.log('Attemp to display peer media...');
  displayStream(`#peer ID: ${id}`, stream);
  }
}

/**
David start
*/

async function requestUserMedia(media_constraints) {
  $self.stream = new MediaStream();
  $self.media = await navigator.mediaDevices
    .getUserMedia(media_constraints);
  $self.stream.addTrack($self.media.getTracks()[0]);
  displayStream('#self', $self.stream);
}

function createVideoElement(id) {
  const figure = document.createElement('figure');
  const figcaption = document.creaetElement('figcaption');
  const video = document.createElement('video');
  const video_attributes = {
    'autoplay': '',
    'playsinline': '',
    'poster': '../images/placeholder.jpg'
  };

  figcaption.innerText = id;
  for (let attr in video_attributes){
    video.setAttribute(attr, video_attributes[attr]);
  }
  figure.appendChild(video);
  figure.appendChild(figcaption);
  return figure;
}

function displayStream(selector, stream) {
  let video_element = document.querySelector(selector);
  if (!video_element) {
    selector = sc.id; //need to create a new peer id if none exists
    video_element = createVideoElement(selector);
  }
  let video = video_element.querySelector('video');
  video.srcObject = stream;
  document.querySelector('#userVideos').appendChild(video_element);
}

function establishCallFeatures(id) {
  registerRtcEvents(VIDEO_CHAT, id, videoChatOnTrack);
  addStreamingMedia(id, $self.stream);
}

function videoChatOnTrack(type, id, stream) {
  console.log('handle video chat ontrack');
}

function addStreamingMedia(id, stream) {
  const peer = $peers[VIDEO_CHAT][id];
  if (stream) {
    for (let track of stream.getTracks()) {
      peer.connection.addTrack(track, stream);
    }
  }
}


/**
David end
*/



/**
Michael start
*/
function establishTextChatFeatures(id) {
  registerRtcEvents(TEXT_CHAT, id, textChatOnDataChannel);
}

function textChatOnDataChannel(type, id, channel) {
  console.log('handle text chat ondatachannel');
}


/**
Michael end
*/



/**
Chiachi start
*/
// TODO get vidoe id from the room settings
function establishVideoControlFeatures(id) {
  registerRtcEvents(VIDEO_CONTROL, id, videoControlOnDataChannel);
  const peer = $peers[VIDEO_CONTROL][id];
  peer.dataChannel = peer.connection.createDataChannel(VIDEO_CONTROL, {
    negotiated: true,
    id: $self.controlDCId,
  });
  peer.dataChannel.onmessage = handleVideoControl;
}

function videoControlOnDataChannel(type, id, channel) {
  console.log('handle video control ondatachannel', type, id, channel);
}

const iframeAPIScript = document.createElement('script');
iframeAPIScript.src = 'https://www.youtube.com/iframe_api';
document.getElementsByTagName('body')[0].append(iframeAPIScript);

const playerDom = document.getElementById('player');
// This will be executed after the YouTubeIframeAPI is loaded.
function onYouTubeIframeAPIReady() {
  $self.player = new YT.Player('player', {
    height: playerDom.clientWidth * 0.5625,
    width: playerDom.clientWidth,
    videoId: $self.videoId,
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
  // Mute to prevent this error "Autoplay is only allowed when approved by the user, the site is activated by the user, or media is muted."
  $self.player.mute();
}

// The will be called when the player's state changes.
function onPlayerStateChange(event) {
  // TODO send command to everyone from some use cases
  if (event.data == YT.PlayerState.PLAYING) {
    console.log('playing...');
  }
}

function startVideo(event) {
  if (event) {
    // command initiate from the user so send the command to everyone
    sendControlCommand('start');
  }
  $self.player.playVideo();
}

function pauseVideo(event) {
  if (event) {
    // command initiate from the user so send the command to everyone
    sendControlCommand('pause');
  }
  $self.player.pauseVideo();
}

function stopVideo(event) {
  if (event) {
    // command initiate from the user so send the command to everyone
    sendControlCommand('stop');
  }
  $self.player.stopVideo();
}

function sendControlCommand(command) {
  for(let peerID in $peers[VIDEO_CONTROL]) {
    console.log('send command to', peerID);
    $peers[VIDEO_CONTROL][peerID].dataChannel.send(command);
  }
}

function handleVideoControl({ data }) {
  console.log(data);
  switch(data) {
    case 'start':
      startVideo();
      break;
    case 'pause':
      pauseVideo();
      break;
    case 'stop':
      stopVideo();
      break;
    default:
      console.log('unknown command');
  }
}

document.getElementById('play-video').addEventListener('click', startVideo);
document.getElementById('pause-video').addEventListener('click', pauseVideo);
document.getElementById('stop-video').addEventListener('click', stopVideo);


/**
Chiachi end
*/
