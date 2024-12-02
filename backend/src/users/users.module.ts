import { forwardRef, Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { JwtModule } from '@nestjs/jwt';
import { EmailModule } from 'src/email/email.module';
import { ConfigModule } from '@nestjs/config';
import { NotificationModule } from 'src/notification/notification.module';
import { SocketModule } from 'src/websocket/socket.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    JwtModule,
    EmailModule,
    ConfigModule,
    SocketModule,
    forwardRef(() => NotificationModule),
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
