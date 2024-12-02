import { Module } from '@nestjs/common';
import { SendGridModule } from '@anchan828/nest-sendgrid';
import { EmailService } from './email.service';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    SendGridModule.forRootAsync({
      useFactory: (configService: ConfigService) => {
        return { apikey: configService.get('SEND_GRID_API_KEY') };
      },
      inject: [ConfigService],
    }),
    ConfigModule,
  ],

  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}
