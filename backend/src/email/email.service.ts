import { Injectable } from '@nestjs/common';
import { SendGridService } from '@anchan828/nest-sendgrid';
import { SendEmailDto } from './dtos/send-email.dto';
import { ConfigService } from '@nestjs/config';
import { AccountCreationEmailDto } from './dtos/account-creation-email.dto';

@Injectable()
export class EmailService {
  constructor(
    private readonly sendGridService: SendGridService,
    private readonly configService: ConfigService,
  ) {}

  async sendEmail(data: SendEmailDto): Promise<void> {
    const params = {
      to: data.email,
      from: this.configService.get('SEND_GRID_FROM_EMAIL'),
      subject: `${data.subject}`,
      html: `${data.html}`,
    };
    try {
      await this.sendGridService.send(params);
    } catch (err) {
      console.log(err);
    }
  }

  async sendAccountCreationEmail(data: AccountCreationEmailDto): Promise<void> { 
    this.sendEmail({
      email: data.email,
      subject: 'Account Created',
      html: `<h2>Hello!</h2>
      You are receiving this email because we have created your admin account. Please use the following credentials to login
      to your account and activate it by assigning a new password.
      <br><br>
      If you did not request an admin account, no further action is required.
      <br><br>
      Email: ${data.email}
      <br>
      Password: ${data.password}
      <br><br>
      Regards,
      <br>
      Inklusive Support Team
      <br><br>
      Use the following link please to reset your password :  <button style="background-color: #4CAF50;
                                                                  border: none;
                                                                  border-radius: 4px;
                                                                  color: white;
                                                                  cursor: pointer;
                                                                  font-size: 16px;
                                                                  line-height: 24px;
                                                                  padding: 10px 20px;
                                                                  text-align: center;
                                                                  text-decoration: none;
      "><a style="text-decoration: none;" href="${this.configService.get(
        'ACTIVATION_FRONT_URL',
      )}"  >
                            Activate
                          </a>
                    </button>
      `
    });
  }
  
  async send2faOtpEmail(data: {email: string, otp: string}): Promise<void> { 
    this.sendEmail({
      email: data.email,
      subject: 'Your 2FA OTP Code',
      html: `<h2>Hello!</h2>
      <p> Your OTP is ${data.otp}. It is valid for 10 minutes.</p>
      `
    });
  }
}
