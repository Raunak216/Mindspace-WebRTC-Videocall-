import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import React, { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import styles from "../styles/videoComponent.module.css";
import IconButton from "@mui/material/IconButton";
import VideocamIcon from "@mui/icons-material/Videocam";
import VideocamOffIcon from "@mui/icons-material/VideocamOff";
import MicIcon from "@mui/icons-material/Mic";
import MicOffIcon from "@mui/icons-material/MicOff";
import ScreenShareIcon from "@mui/icons-material/ScreenShare";
import StopScreenShareIcon from "@mui/icons-material/StopScreenShare";
import ChatIcon from "@mui/icons-material/Chat";
import CallEndIcon from "@mui/icons-material/CallEnd";
import Badge from "@mui/material/Badge";
import { useNavigate } from "react-router-dom";
import server from "../environment";

const server_url = server;

const connections = {};
const peerConfigConnections = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

// Isolated component — only re-renders when stream changes,
// not when chat state (message, messages) changes. This stops the blink.
const RemoteVideo = React.memo(({ socketId, stream }) => {
  const ref = React.useRef();
  React.useEffect(() => {
    if (ref.current && stream) {
      ref.current.srcObject = stream;
    }
  }, [stream]);
  return <video ref={ref} data-socket={socketId} autoPlay playsInline />;
});

export default function VideoMeetComponent() {
  var socketRef = useRef();
  let socketIdRef = useRef();
  let localVideoRef = useRef();
  let [videoAvailable, setVideoAvailable] = useState(true);
  let [audioAvailable, setAudioAvailable] = useState(true);
  let [video, setVideo] = useState();
  let [audio, setAudio] = useState();
  let [screen, setScreen] = useState();
  let [showModal, setShowModal] = useState();
  let [screenAvailable, setScreenAvailable] = useState();
  let [messages, setMessages] = useState([]);
  let [message, setMessage] = useState("");
  let [newMessage, setNewMessage] = useState(0);
  let [askForUsername, setAskForUsername] = useState(true);
  let [username, setUsername] = useState("");
  const videoRef = useRef([]);
  let [videos, setVideos] = useState([]);

  const getPermission = async () => {
    try {
      const videoPermission = await navigator.mediaDevices.getUserMedia({
        video: true,
      });
      if (videoPermission) {
        setVideoAvailable(true);
      } else {
        setVideoAvailable(false);
      }

      const audioPermission = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      if (audioPermission) {
        setAudioAvailable(true);
      } else {
        setAudioAvailable(false);
      }

      if (navigator.mediaDevices.getDisplayMedia) {
        setScreenAvailable(true);
      } else {
        setScreenAvailable(false);
      }

      if (videoAvailable || audioAvailable) {
        const userMediaStream = await navigator.mediaDevices.getUserMedia({
          video: videoAvailable,
          audio: audioAvailable,
        });
        if (userMediaStream) {
          window.localStream = userMediaStream;
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = userMediaStream;
          }
        }
      }
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    getPermission();
  }, []);

  let silence = () => {
    let audioCtx = new AudioContext();
    let oscillator = audioCtx.createOscillator();
    let dst = oscillator.connect(audioCtx.createMediaStreamDestination());
    oscillator.start();
    audioCtx.resume();
    return Object.assign(dst.stream.getAudioTracks()[0], { enabled: false });
  };

  let black = ({ width = 640, height = 480 } = {}) => {
    let canvas = Object.assign(document.createElement("canvas"), {
      width,
      height,
    });
    canvas.getContext("2d").fillRect(0, 0, width, height);
    let stream = canvas.captureStream();
    return Object.assign(stream.getVideoTracks()[0], { enabled: false });
  };

  let getUserMediaSuccess = (stream) => {
    try {
      window.localStream.getTracks().forEach((track) => track.stop());
    } catch (e) {
      console.log(e);
    }

    window.localStream = stream;
    localVideoRef.current.srcObject = stream;

    for (let id in connections) {
      if (id === socketIdRef.current) continue;
      connections[id].addStream(window.localStream);
      connections[id].createOffer().then((description) => {
        connections[id]
          .setLocalDescription(description)
          .then(() => {
            socketRef.current.emit(
              "signal",
              id,
              JSON.stringify({ sdp: connections[id].localDescription }),
            );
          })
          .catch((e) => console.log(e));
      });
    }

    stream.getTracks().forEach(
      (track) =>
        (track.onended = () => {
          setVideo(false);
          setAudio(false);
          try {
            let tracks = localVideoRef.current.srcObject.getTracks();
            tracks.forEach((track) => track.stop());
          } catch (e) {
            console.log(e);
          }

          let blackSilence = (...args) =>
            new MediaStream([black(...args), silence()]);
          window.localStream = blackSilence();
          localVideoRef.current.srcObject = window.localStream;

          for (let id in connections) {
            connections[id].addStream(window.localStream);
            connections[id].createOffer().then((description) => {
              connections[id]
                .setLocalDescription(description)
                .then(() => {
                  socketRef.current.emit(
                    "signal",
                    id,
                    JSON.stringify({ sdp: connections[id].localDescription }),
                  );
                })
                .catch((e) => console.log(e));
            });
          }
        }),
    );
  };

  let getUserMedia = () => {
    if ((video && videoAvailable) || (audio && audioAvailable)) {
      navigator.mediaDevices
        .getUserMedia({ video: video, audio: audio })
        .then(getUserMediaSuccess)
        .then((stream) => {})
        .catch((e) => {
          console.log(e);
        });
    } else {
      try {
        let tracks = localVideoRef.current.srcObject.getTracks();
        tracks.forEach((tracks) => tracks.stop());
      } catch (e) {}
    }
  };

  useEffect(() => {
    if (video !== undefined && audio !== undefined) {
      getUserMedia();
    }
  }, [audio, video]);

  let getMessageFromServer = (fromId, message) => {
    var signal = JSON.parse(message);
    if (fromId !== socketIdRef.current) {
      connections[fromId]
        .setRemoteDescription(new RTCSessionDescription(signal.sdp))
        .then(() => {
          if (signal.sdp.type === "offer") {
            connections[fromId]
              .createAnswer()
              .then((description) =>
                connections[fromId]
                  .setLocalDescription(description)
                  .then(() => {
                    socketRef.current.emit(
                      "signal",
                      fromId,
                      JSON.stringify({
                        sdp: connections[fromId].localDescription,
                      }),
                    );
                  })
                  .catch((e) => console.log(e)),
              )
              .catch((e) => console.log(e));
          }
        })
        .catch((e) => console.log(e));
    }
    if (signal.ice) {
      connections[fromId]
        .addIceCandidate(new RTCIceCandidate(signal.ice))
        .catch((e) => console.log(e));
    }
  };

  let addMessage = (sender, data, socketIdSender) => {
    setMessages((prevMessages) => [
      ...prevMessages,
      { sender: sender, data: data },
    ]);
    if (socketIdSender !== socketIdRef.current) {
      setNewMessage((prevMessages) => prevMessages + 1);
    }
  };

  let getDisplayMediaSuccess = (stream) => {
    try {
      window.localStream.getTracks().forEach((track) => track.stop());
    } catch (e) {
      console.log(e);
    }

    window.localStream = stream;
    localVideoRef.current.srcObject = stream;

    for (let id in connections) {
      if (id === socketIdRef.current) continue;
      connections[id].addStream(window.localStream);
      connections[id].createOffer().then((description) => {
        connections[id]
          .setLocalDescription(description)
          .then(() => {
            socketRef.current.emit(
              "signal",
              id,
              JSON.stringify({ sdp: connections[id].localDescription }),
            );
          })
          .catch((e) => console.log(e));
      });
    }

    stream.getTracks().forEach(
      (track) =>
        (track.onended = () => {
          setScreen(false);
          try {
            let tracks = localVideoRef.current.srcObject.getTracks();
            tracks.forEach((track) => track.stop());
          } catch (e) {
            console.log(e);
          }

          let blackSilence = (...args) =>
            new MediaStream([black(...args), silence()]);
          window.localStream = blackSilence();
          localVideoRef.current.srcObject = window.localStream;
          getUserMedia();
        }),
    );
  };

  let displayMedia = () => {
    if (screen) {
      if (navigator.mediaDevices.getDisplayMedia) {
        navigator.mediaDevices
          .getDisplayMedia({ video: true, audio: true })
          .then(getDisplayMediaSuccess)
          .then((stream) => {})
          .catch((e) => console.log(e));
      }
    }
  };

  let connectToSocketServer = () => {
    socketRef.current = io.connect(server_url, { secure: false });
    socketRef.current.on("signal", getMessageFromServer);

    socketRef.current.on("connect", () => {
      socketRef.current.emit("join-call", window.location.href);
      socketIdRef.current = socketRef.current.id;

      socketRef.current.on("chat-message", (data, sender, socketIdSender) => {
        addMessage(sender, data, socketIdSender);
      });

      socketRef.current.on("user-left", (id) => {
        setVideos((videos) => videos.filter((video) => video.socketId !== id));
      });

      socketRef.current.on("user-joined", (id, clients) => {
        clients.forEach((socketListId) => {
          connections[socketListId] = new RTCPeerConnection(
            peerConfigConnections,
          );

          connections[socketListId].onicecandidate = function (event) {
            if (event.candidate != null) {
              socketRef.current.emit(
                "signal",
                socketListId,
                JSON.stringify({ ice: event.candidate }),
              );
            }
          };

          connections[socketListId].onaddstream = (event) => {
            let videoExists = videoRef.current.find(
              (video) => video.socketId === socketListId,
            );
            if (videoExists) {
              setVideos((videos) => {
                const updatedVideos = videos.map((video) =>
                  video.socketId === socketListId
                    ? { ...video, stream: event.stream }
                    : video,
                );
                videoRef.current = updatedVideos;
                return updatedVideos;
              });
            } else {
              let newVideo = {
                socketId: socketListId,
                stream: event.stream,
                autoplay: true,
                playsinline: true,
              };
              setVideos((videos) => {
                const updatedVideos = [...videos, newVideo];
                videoRef.current = updatedVideos;
                return updatedVideos;
              });
            }
          };

          if (window.localStream !== undefined && window.localStream !== null) {
            connections[socketListId].addStream(window.localStream);
          } else {
            let blackSilence = (...args) =>
              new MediaStream([black(...args), silence()]);
            window.localStream = blackSilence();
            connections[socketListId].addStream(window.localStream);
          }
        });

        if (id === socketIdRef.current) {
          for (let id2 in connections) {
            if (id2 === socketIdRef.current) continue;
            try {
              connections[id2].addStream(window.localStream);
            } catch (e) {}
            connections[id2].createOffer().then((description) => {
              connections[id2]
                .setLocalDescription(description)
                .then(() => {
                  socketRef.current.emit(
                    "signal",
                    id2,
                    JSON.stringify({ sdp: connections[id2].localDescription }),
                  );
                })
                .catch((e) => console.log(e));
            });
          }
        }
      });
    });
  };

  useEffect(() => {
    if (screen) {
      displayMedia();
    } else {
      getUserMedia();
    }
  }, [screen]);

  let getMedia = () => {
    setVideo(videoAvailable);
    setAudio(audioAvailable);
    if (localVideoRef.current.previewStream) {
      window.localStream = localVideoRef.current.previewStream;
    }
    connectToSocketServer();
  };

  let connect = () => {
    setAskForUsername(false);
    getMedia();
  };

  let handelVideo = () => {
    setVideo(!video);
  };
  let handelAudio = () => {
    setAudio(!audio);
  };
  let handelScreenShare = () => {
    setScreen(!screen);
  };
  let handelChat = () => {
    setShowModal(!showModal);
  };

  let sendMessage = () => {
    socketRef.current.emit("chat-message", message, username);
    setMessage("");
  };

  let navigate = useNavigate();

  // ── CAMERA FIX: stop all tracks and disconnect socket before navigating ──
  let handelLeaveCall = () => {
    // Stop every camera / mic / screen track so the browser indicator light goes off
    if (window.localStream) {
      window.localStream.getTracks().forEach((track) => track.stop());
      window.localStream = null;
    }
    // Clear the local video element
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }
    // Close all peer connections
    Object.values(connections).forEach((conn) => conn.close());
    // Disconnect socket
    if (socketRef.current) {
      socketRef.current.disconnect();
    }
    navigate("/home");
  };

  useEffect(() => {
    if (window.localStream && localVideoRef.current) {
      localVideoRef.current.srcObject = window.localStream;
    }
  }, []);

  return (
    <>
      <div>
        {askForUsername === true ? (
          /* ── Lobby / username screen ── */
          <div className={styles.usernameWindowOuter}>
            <div className={styles.lobbyNav}>
              Mind<span className={styles.logoAccent}>Space</span>.
            </div>

            <div className={styles.usernameWindowInner}>
              <div className={styles.enterUsername}>
                <p className={styles.lobbyTitle}>Ready to join?</p>
                <p className={styles.lobbySubtitle}>
                  Enter your name to join the room
                </p>
                <input
                  className={styles.lobbyInput}
                  placeholder="Your name"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && connect()}
                />
                <button className={styles.lobbyBtn} onClick={connect}>
                  Join Room →
                </button>
              </div>

              <div className={styles.myVideoCheck}>
                <video ref={localVideoRef} autoPlay muted></video>
                <p>Allow camera and microphone access to join.</p>
              </div>
            </div>
          </div>
        ) : (
          /* ── Active call screen ── */
          <div className={styles.meetVideoContainer}>
            {/* Chat panel */}
            {showModal && (
              <div className={styles.chatRoom}>
                <div className={styles.chatContainer}>
                  <h1>Messages</h1>
                  <div className={styles.chatMessages}>
                    {messages.length > 0 ? (
                      messages.map((item, index) => (
                        <div className={styles.message} key={index}>
                          <p className={styles.sender}>{item.sender}</p>
                          <p className={styles.messageSent}>{item.data}</p>
                        </div>
                      ))
                    ) : (
                      <p className={styles.noMessages}>No messages yet</p>
                    )}
                  </div>
                  <div className={styles.sendMessage}>
                    <input
                      className={styles.chatInput}
                      placeholder="Write a message…"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                    />
                    <button className={styles.sendBtn} onClick={sendMessage}>
                      Send
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Control bar */}
            <div className={styles.buttonContainer}>
              <button
                className={`${styles.ctrlBtn} ${!video ? styles.ctrlBtnOff : ""}`}
                onClick={handelVideo}
                title={video ? "Turn off camera" : "Turn on camera"}
              >
                {video ? <VideocamIcon /> : <VideocamOffIcon />}
              </button>

              <button
                className={`${styles.ctrlBtn} ${!audio ? styles.ctrlBtnOff : ""}`}
                onClick={handelAudio}
                title={audio ? "Mute" : "Unmute"}
              >
                {audio ? <MicIcon /> : <MicOffIcon />}
              </button>

              <button
                className={`${styles.ctrlBtn} ${styles.ctrlBtnEnd}`}
                onClick={handelLeaveCall}
                title="End call"
              >
                <CallEndIcon />
              </button>

              <button
                className={`${styles.ctrlBtn} ${screen ? styles.ctrlBtnActive : ""}`}
                onClick={handelScreenShare}
                title={screen ? "Stop sharing" : "Share screen"}
              >
                {screen ? <ScreenShareIcon /> : <StopScreenShareIcon />}
              </button>

              <button
                className={`${styles.ctrlBtn} ${showModal ? styles.ctrlBtnActive : ""}`}
                onClick={handelChat}
                title="Chat"
              >
                <Badge badgeContent={newMessage} max={100} color="secondary">
                  <ChatIcon />
                </Badge>
              </button>
            </div>

            {/* Local video pip */}
            <video
              className={styles.meetUserVideo}
              ref={localVideoRef}
              autoPlay
              muted
            />

            {/* Remote videos grid */}
            <div className={styles.conferenceContainer}>
              {videos
                .filter((video) => video.stream)
                .map((video) => (
                  <div key={video.socketId} className={styles.videoTile}>
                    <RemoteVideo
                      socketId={video.socketId}
                      stream={video.stream}
                    />
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
