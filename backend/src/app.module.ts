import { Module, ValidationPipe } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User } from './users/entities/user.entity';
import { APP_PIPE } from '@nestjs/core';
import { NotificationModule } from './notification/notification.module';
import { EmailModule } from './email/email.module';
import { AuthModule } from './auth/auth.module';
import { Notification } from './notification/entities/notification.entity';
import { SocketModule } from './websocket/socket.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env'
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('POSTGRES_DB_HOST'),
        port: configService.get<number>('POSTGRES_DB_PORT'),
        username: configService.get<string>('POSTGRES_DB_USERNAME'),
        password: configService.get<string>('POSTGRES_DB_PASSWORD'),
        database: configService.get<string>('POSTGRES_DB_NAME'),
        entities: [User, Notification],
        synchronize: true
      }),
      inject: [ConfigService],
    }),
    UsersModule,
    AuthModule,
    NotificationModule,
    EmailModule,
    SocketModule
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        whitelist: true,
        transform: true
      })
    }
  ],
})
export class AppModule {}
