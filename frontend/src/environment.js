let isProd = true;
const server = isProd
  ? "https://mindspace-web-rtc-videocall-backend-two.vercel.app"
  : "http://localhost:8080";

export default server;
