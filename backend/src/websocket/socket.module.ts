import { Module } from '@nestjs/common';
import { SocketServeice } from './socket.service';

@Module({
  providers: [SocketServeice],
  exports: [SocketServeice],
})
export class SocketModule {}
