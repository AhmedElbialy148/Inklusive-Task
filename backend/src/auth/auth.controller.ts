import { BadRequestException, Body, Controller, Param, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dtos/login.dto';
import { ForgotPasswordDto } from './dtos/forget-password.dto';
import { ResetPasswordDto } from './dtos/reset-password.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RefreshTokenDto } from './dtos/refresh-token.dto';
import { RefreshTokenGuard } from 'src/common/guards/refresh-token.guard';
import { ChangePasswordDto } from './dtos/change-password.dto';
import { AccessTokenGuard } from 'src/common/guards/access-token.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { AuthenticatedUser } from 'src/common/interfaces/authenticated-user.interface';
import { ChangeEmailDto, RequestToChangeEmailDto } from './dtos/change-email.dto';
import { ActivateUserDto } from './dtos/activate-user.dto';

@Controller('auth')
@ApiTags('Auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  login(@Body() data: LoginDto) {
    return this.authService.login(data);
  }

  @Post('logout')
  logout(@Body() id: string) {
    return this.authService.logout(id);
  }

  @Post('activate')
  activate(@Body() body:ActivateUserDto) {
    return this.authService.activateUser(body);
  }

  @UseGuards(RefreshTokenGuard)
  @Post('refresh')
  @ApiBearerAuth()
  refreshTokens(@Req() req, @Body() refreshTokenDto: RefreshTokenDto) {
    const userId = req.user['sub'].toString();
    return this.authService.refreshTokens(userId, refreshTokenDto);
  }

  @Post('send-otp')
  @UseGuards(AccessTokenGuard)
  async sendOTP(@CurrentUser() user: AuthenticatedUser) {
    console.log('here');
    return this.authService.sendOTP(user.sub);
  }

  @Post('verify-otp')
  @UseGuards(AccessTokenGuard)
  async verifyOTP(@CurrentUser() currentUser: AuthenticatedUser, @Body() body: { otp: string }) {
    return this.authService.verifyOTP(currentUser.sub, body);
  }


  // @Post('forget-password')
  // forgotPassword(@Body() body: ForgotPasswordDto) {
  //   return this.authService.forgotPassword(body);
  // }
  
  // @Post('change-password')
  // @ApiBearerAuth()
  // @UseGuards(AccessTokenGuard)
  // changePassword( @Body() changePasswordDto: ChangePasswordDto, @CurrentUser() user: AuthenticatedUser ) {
  //   return this.authService.changePassword(user.sub, changePasswordDto );
  // }

  // @Post('/reset-password/:token')
  // resetPassword(@Param('token') token: string, @Body() body: ResetPasswordDto) {
  //   return this.authService.resetPassword(token, body);
  // }
}
