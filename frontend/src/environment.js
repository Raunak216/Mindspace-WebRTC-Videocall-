let isProd = false;
const server = isProd
  ? "https://mindspace-webrtc-videocall-2.onrender.com"
  : "http://localhost:8080";

export default server;
