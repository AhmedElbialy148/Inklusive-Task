import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class ActivateUserDto {
  @ApiProperty()  
  @IsEmail()
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @ApiProperty()  
  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  password: string;

  @ApiProperty()  
  @IsString()
  @IsNotEmpty({ message: 'New Password is required' })
  newPassword: string;

  @ApiProperty()  
  @IsString()
  @IsNotEmpty({ message: 'New Password Confirmation is required' })
  confirmNewPassword: string;
}