import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsIn } from 'class-validator';
import { RoleEnum } from 'src/common/enums';

export class UpdateCurrentUserDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()  
  username: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()  
  phoneNumber: string;
}

export class UpdateUserDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()  
  username: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()  
  phoneNumber: string;

  @ApiPropertyOptional()
  @IsIn(Object.values(RoleEnum))
  @IsOptional()  
  role: string;
}
