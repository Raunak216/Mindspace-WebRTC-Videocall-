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
import { redirect } from "react-router-dom";
import Badge from "@mui/material/Badge";
import { useNavigate } from "react-router-dom";

const server_url = "http://localhost:8080";

const connections = {};
const peerConfigConnections = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};
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

  //blacksilence
  //audio
  let silence = () => {
    let audioCtx = new AudioContext();
    let oscillator = audioCtx.createOscillator();
    let dst = oscillator.connect(audioCtx.createMediaStreamDestination());
    oscillator.start();
    audioCtx.resume();
    return Object.assign(dst.stream.getAudioTracks()[0], {
      enabled: false,
    });
  };
  //video
  let black = ({ width = 640, height = 480 } = {}) => {
    let canvas = Object.assign(document.createElement("canvas"), {
      width,
      height,
    });
    canvas.getContext("2d").fillRect(0, 0, width, height);
    let stream = canvas.captureStream();
    return Object.assign(stream.getVideoTracks()[0], {
      enabled: false,
    });
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
        console.log(description);
        connections[id]
          .setLocalDescription(description)
          .then(() => {
            socketRef.current.emit(
              "signal",
              id,
              JSON.stringify({ sdp: connections[id].localDescription })
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
                    JSON.stringify({ sdp: connections[id].localDescription })
                  );
                })
                .catch((e) => console.log(e));
            });
          }
        })
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
                      })
                    );
                  })
                  .catch((e) => console.log(e))
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
              JSON.stringify({ sdp: connections[id].localDescription })
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
        })
    );
  };

  //----------------------------------------------------------------------------------------
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
  //----------------------------------------------------------------------------------------
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
            peerConfigConnections
          );
          // Wait for their ice candidate
          connections[socketListId].onicecandidate = function (event) {
            if (event.candidate != null) {
              socketRef.current.emit(
                "signal",
                socketListId,
                JSON.stringify({ ice: event.candidate })
              );
            }
          };

          // Wait for their video stream
          connections[socketListId].onaddstream = (event) => {
            console.log("BEFORE:", videoRef.current);
            console.log("FINDING ID: ", socketListId);

            let videoExists = videoRef.current.find(
              (video) => video.socketId === socketListId
            );

            if (videoExists) {
              console.log("FOUND EXISTING");

              // Update the stream of the existing video
              setVideos((videos) => {
                const updatedVideos = videos.map((video) =>
                  video.socketId === socketListId
                    ? { ...video, stream: event.stream }
                    : video
                );
                videoRef.current = updatedVideos;
                return updatedVideos;
              });
            } else {
              // Create a new video
              console.log("CREATING NEW");
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

          // Add the local video stream
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
                    JSON.stringify({ sdp: connections[id2].localDescription })
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
  let handelLeaveCall = () => {
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
          <div className={styles.usernameWindowOuter}>
            <h2>MindSpace</h2>
            <div className={styles.usernameWindowInner}>
              <div className={styles.enterUsername}>
                <p>Enter your name to join the room</p>
                <TextField
                  id="outlined-basic"
                  label="Username"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                  }}
                />
                <Button variant="contained" onClick={connect}>
                  Connect
                </Button>
              </div>

              <div className={styles.myVideoCheck}>
                <video ref={localVideoRef} autoPlay muted></video>
                <p>
                  To connect with your study group, please allow access to your
                  camera and microphone.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className={styles.meetVideoContainer}>
            {showModal ? (
              <div className={styles.chatRoom}>
                <div className={styles.chatContainer}>
                  <h1>In-call messages</h1>
                  <hr />
                  <div className={styles.chatMessages}>
                    {messages.length > 0 ? (
                      messages.map((item, index) => {
                        return (
                          <div className={styles.message} key={index}>
                            <p className={styles.sender}>{item.sender}</p>
                            <p className={styles.messageSent}>{item.data}</p>
                          </div>
                        );
                      })
                    ) : (
                      <></>
                    )}
                  </div>
                  <div className={styles.sendMessage}>
                    <TextField
                      className={styles.chatText}
                      id="outlined-basic"
                      label="Write message ..."
                      variant="outlined"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                    />
                    <Button variant="contained" onClick={sendMessage}>
                      Send
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <></>
            )}
            <div className={styles.buttonContainer}>
              <IconButton onClick={handelVideo}>
                {video === true ? (
                  <VideocamIcon style={{ color: "white" }} />
                ) : (
                  <VideocamOffIcon style={{ color: "red" }} />
                )}
              </IconButton>
              <IconButton onClick={handelAudio}>
                {audio === true ? (
                  <MicIcon style={{ color: "white" }} />
                ) : (
                  <MicOffIcon style={{ color: "red" }} />
                )}
              </IconButton>
              <IconButton onClick={handelLeaveCall} style={{ color: "red" }}>
                <CallEndIcon />
              </IconButton>
              <IconButton
                onClick={handelScreenShare}
                style={{ color: "white" }}
              >
                {screen === true ? (
                  <ScreenShareIcon />
                ) : (
                  <StopScreenShareIcon />
                )}
              </IconButton>
              <Badge badgeContent={newMessage} max={100} color="secondary">
                <IconButton onClick={handelChat} style={{ color: "white" }}>
                  <ChatIcon />
                </IconButton>
              </Badge>
            </div>

            <video
              className={styles.meetUserVideo}
              ref={localVideoRef}
              autoPlay
              muted
            ></video>

            <div className={styles.conferenceContainer}>
              {videos
                .filter((video) => video.stream)
                .map((video) => (
                  <div key={video.socketId}>
                    <video
                      data-socket={video.socketId}
                      ref={(ref) => {
                        if (ref && video.stream) {
                          ref.srcObject = video.stream;
                        }
                      }}
                      autoPlay
                      playsInline
                    ></video>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
