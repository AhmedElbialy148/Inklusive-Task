import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class CreateUserDto {
  @ApiProperty()
  @IsEmail()
  @IsNotEmpty({ message: "Email is required" })  
  email: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: "Password is required" })  
  password: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: "Username is required" })  
  username: string;
}
