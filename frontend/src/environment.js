let isProd = true;
const server = isProd
  ? "https://mindspace-webrtc-videocall-3.onrender.com"
  : "http://localhost:8080";

export default server;
