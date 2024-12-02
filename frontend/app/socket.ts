import { io, Socket } from "socket.io-client";
import { settings } from "@/app.config";
export const socket: Socket = io(settings.env.backendHost);

// export const initializeSocket = () => {
//   if (!socket) {
//     socket = io(settings.env.backendHost); // Replace with your backend URL

//     socket.on("connect", () => {
//       console.log("Connected to the backend");
//     });
//   }
//   return socket;
// };

// export const getSocket = () => {
//   if (!socket) {
//     throw new Error("Socket not initialized. Call initializeSocket() first.");
//   }
//   return socket;
// };
