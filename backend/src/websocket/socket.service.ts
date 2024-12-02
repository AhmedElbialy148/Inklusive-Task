import { ConfigService } from "@nestjs/config";
import { WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server } from "socket.io";

@WebSocketGateway({
  cors: {
    origin: (requestOrigin: string, callback: (err: Error | null, allow?: boolean) => void) => {
      const configService = new ConfigService();
      const allowedOrigin = configService.get<string>('FRONT_HOST_URL');
      if (requestOrigin === allowedOrigin) {
        callback(null, true); // Allow the request
      } else {
        callback(new Error('Not allowed by CORS')); // Reject the request
      }
    },
    credentials: true,
  },
})
export class SocketServeice {
  @WebSocketServer() server: Server

  broadcast(event: string, data: any) {
    this.server.emit(event, data);
  }
}