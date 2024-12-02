import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsInt, IsNotEmpty, Max, Min } from 'class-validator';

export class RequestToChangeEmailDto {
  @ApiProperty()
  @IsEmail()
  @IsNotEmpty()
  email: string;
}

export class ChangeEmailDto  {
  @ApiProperty()
  @IsNotEmpty()
  @IsInt()
  @Min(1000)
  @Max(9999)
  verificationCode: number;
}
