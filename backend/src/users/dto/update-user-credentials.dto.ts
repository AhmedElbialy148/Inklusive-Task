import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsIn, IsBoolean } from 'class-validator';
import { UserStatusEnum } from 'src/common/enums';

export class UpdateUserCredentialsDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()  
  password?: string;

  @ApiPropertyOptional()
  @IsIn(Object.values(UserStatusEnum))
  @IsOptional()  
  status?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()  
  otp?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()  
  otpExpiresAt?: Date;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()  
  is2FAVerified?: boolean;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()  
  refreshToken?: string;
}