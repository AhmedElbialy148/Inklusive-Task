import { BadRequestException, ForbiddenException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import * as argon2 from 'argon2';
import * as jwt from 'jsonwebtoken';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { LoginDto } from './dtos/login.dto';
import { ForgotPasswordDto } from './dtos/forget-password.dto';
import { EmailService } from 'src/email/email.service';
import { ResetPasswordDto } from './dtos/reset-password.dto';
import { hashData } from 'src/common/helpers/password.helper';
import { RefreshTokenDto } from './dtos/refresh-token.dto';
import { ChangePasswordDto } from './dtos/change-password.dto';
import { AuthenticatedUser } from 'src/common/interfaces/authenticated-user.interface';
import { ChangeEmailDto, RequestToChangeEmailDto } from './dtos/change-email.dto';
import { RoleEnum, UserStatusEnum } from 'src/common/enums';
import { User } from 'src/users/entities/user.entity';
import { ActivateUserDto } from './dtos/activate-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private readonly emailService: EmailService,
  ) {
  }

  async login(data: LoginDto) {
    const user = await this.usersService.findOneByEmail(data.email);
    if (!user) throw new BadRequestException('User does not exist');

    const passwordMatches = await argon2.verify(user.password, data.password);
    if (!passwordMatches) throw new BadRequestException('Password is incorrect');

    // Check if user is inactive (first login)
    if (user.status == UserStatusEnum.INACTIVE) {
      const passwordMatches = await argon2.verify(user.password, data.password);
      if (!passwordMatches) throw new BadRequestException('Password is incorrect');
      return { message: 'Please change the password to activate your account', status: UserStatusEnum.INACTIVE };
    }

    return await this.formatLoginAndSignUpResponse(user);
  }

  async activateUser(body: ActivateUserDto) {
    const user = await this.usersService.findOneByEmail(body.email);
    if (!user) throw new BadRequestException('User email is not registered');
    if (body.newPassword !== body.confirmNewPassword) throw new BadRequestException('Password and confirm password do not match');

    // Check password match
    const passwordMatches = await argon2.verify(user.password, body.password);
    if (!passwordMatches) throw new BadRequestException('Password is incorrect');

    // Hash password
    await this.usersService.updateUserCredentials(user.id.toString(), { password: body.newPassword, status: UserStatusEnum.ACTIVE });

    return await this.formatLoginAndSignUpResponse(user);
  }

  async formatLoginAndSignUpResponse(user: User) {
    // Generate new tokens
    const tokens = await this.generateTokens( user.id.toString(), user.role, user.is2FAVerified );
    // Update user refresh token
    await this.usersService.updateUserCredentials(user.id.toString(), { refreshToken: tokens.refreshToken });
    return {
      ...tokens,
    };
  }

  async changePassword( userId: string, { password, newPassword }: ChangePasswordDto ) {
    const user = await this.usersService.findOneById(userId);
    const passwordMatches = await argon2.verify(user.password, password);
    if (!passwordMatches)
      throw new BadRequestException('Password is incorrect');

    await this.usersService.updateUserCredentials(userId, {password: newPassword});
    return { message: 'Password changed successfully' };
  }

  async logout(userId: string) {
    await this.usersService.updateUserCredentials(userId, { refreshToken: null });
    return { message: 'Logout successfully' };
  }



  // async forgotPassword(data: ForgotPasswordDto) {
  //   const user = await this.usersService.findByEmailOrUsername(data.email);

  //   if (!user || user.archivedAt != null)
  //     throw new NotFoundException('This user does not belong to this system');

  //   const token = await this.generateResetPasswordToken(user._id);
  //   const generalSettings = await this.systemPreferencesService.getGeneralSettings();
    
  //   this.emailService.sendEmail({
  //     email: data.email,
  //     subject: 'Forgot Password',
  //     html: `<h2>Hello!</h2>
  //     You are receiving this email because we received a password reset request for your account.
  //     <br><br>
  //     If you did not request a password reset, no further action is required.
  //     <br><br>
  //     Regards,
  //     <br><br>
  //     ${generalSettings.projectName} Support Team
  //     <br><br>
  //     Use the following link please to reset your password :  <button style="background-color: #4CAF50;
  //                                                                 border: none;
  //                                                                 border-radius: 4px;
  //                                                                 color: white;
  //                                                                 cursor: pointer;
  //                                                                 font-size: 16px;
  //                                                                 line-height: 24px;
  //                                                                 padding: 10px 20px;
  //                                                                 text-align: center;
  //                                                                 text-decoration: none;
  //     "><a style="text-decoration: none;" href="${this.configService.get(
  //       'RESET_PASSWORD_URL',
  //     )}/${token}"  >
  //                           Reset Password
  //                         </a>
  //                   </button>
  //     `,
  //   });

  //   return { message: 'email sent to reset your password' };
  // }

  // async resetPassword(token: string, data: ResetPasswordDto) {
  //   const user: any = await this.verifyResetPasswordToken(token);

  //   const password = await hashData(data.password);
  //   await this.usersService.update(user.userId, { password });

  //   return { message: 'Password changed successfully' };
  // }

  // // Generate a password reset token
  // async generateResetPasswordToken(userId: any) {
  //   return await jwt.sign({ userId }, this.configService.get('JWT_RESET_SECRET'), {
  //     expiresIn: '3h',
  //   });
  // }

  // // Verify a password reset token
  // async verifyResetPasswordToken(token: string) {
  //   try {
  //     const decoded = await jwt.verify(
  //       token,
  //       this.configService.get('JWT_RESET_SECRET'),
  //     );
  //     return decoded;
  //   } catch (err) {
  //     throw new BadRequestException('Invalid Token');
  //   }
  // }

  async refreshTokens(userId: string, { refreshToken }: RefreshTokenDto) {
    // Validate the refresh token with the database
    const user = await this.usersService.findOneById(userId);
    if (!user || user.refreshToken !== refreshToken) throw new UnauthorizedException('Invalid refresh token');

    try {
      // Verify the refresh token
      const decoded = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });

      // Ensure the token belongs to the user
      if (decoded.sub !== userId) {
        throw new UnauthorizedException('Invalid token payload');
      }

      // Generate new tokens
      let newTokens = await this.generateTokens(userId, user.role, user.is2FAVerified);

      // Update the refresh token in the database
      await this.usersService.updateUserCredentials(userId, { refreshToken: newTokens.refreshToken });

      return newTokens;
    } catch (error) {
      throw new UnauthorizedException('Refresh token expired or invalid');
    }
  }

  async generateTokens( userId: string, role: string, is2FAVerified: boolean ) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        { sub: userId, role, is2FAVerified },
        {
          secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
          expiresIn: `1d`,
        },
      ),
      this.jwtService.signAsync(
        { sub: userId, role, is2FAVerified },
        {
          secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
          expiresIn: '7d',
        },
      ),
    ]);

    return { accessToken, refreshToken };
  }

  async sendOTP(userId: string) {
    // Get current user data
    const user = await this.usersService.findOneById(userId);
    const { otp, expiresAt } = this.generateOTP();

    // Save OTP and expiration time to the user's record in the database
    await this.usersService.updateUserCredentials(userId, {otp, otpExpiresAt: expiresAt});
    this.emailService.send2faOtpEmail({email: user.email, otp});

    return { message: 'OTP sent to your email' };
  }

  generateOTP = (): { otp: string; expiresAt: Date } => {
    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now
    return { otp, expiresAt };
  };

  async verifyOTP(userId: string, body: { otp: string }) {
    let user = await this.usersService.findOneById(userId);
    const { otp } = body;

    // Verify OTP
    if (new Date() > user.otpExpiresAt) {
      throw new BadRequestException('OTP has expired');
    }
    if (user.otp !== otp) {
      throw new BadRequestException('Invalid OTP');
    }

    // Mark 2FA as complete
    await this.usersService.updateUserCredentials(userId, { is2FAVerified: true });

    return { message: '2FA verified successfully' };
  }
}
