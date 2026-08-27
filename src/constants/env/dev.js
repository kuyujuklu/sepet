import Constants from "expo-constants";

// The local backend. `backend/.env` sets PORT=9999, and main.go mounts its
// uploads at /static (production serves them from /api-static instead - see
// prod.js).
const API_PORT = 9999;

// Where the backend is reachable *from the device running the app*, which is
// not the same answer everywhere:
//
//  - a phone on the same wifi needs this machine's LAN address;
//  - the iOS simulator and the web build can just say localhost;
//  - the Android emulator reaches the host through 10.0.2.2.
//
// The default handles the first two on its own by reusing whatever host Metro
// is already being served from - on a device that is exactly the LAN address
// the phone needs, and it follows the machine around instead of going stale
// every time DHCP hands out a new lease (which is what happened to the
// 192.168.100.52 that used to be hardcoded here).
//
// Set EXPO_PUBLIC_API_HOST in .env to override it - that is the Android
// emulator's 10.0.2.2, or a tunnel/ngrok host.
const hostUri =
  Constants.expoConfig?.hostUri ??
  Constants.expoGoConfig?.debuggerHost ??
  "";

const metroHost = hostUri.split(":")[0];
const host = process.env.EXPO_PUBLIC_API_HOST || metroHost || "localhost";

export default {
  WS_SCHEME: "ws",
  API_SERV: `${host}:${API_PORT}`,
  API_HTTP_URL: `http://${host}:${API_PORT}`,
  API_STATIC_PATH: "/static",
};
