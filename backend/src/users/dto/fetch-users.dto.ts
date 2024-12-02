import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsEmail, IsOptional } from "class-validator";
import { PaginationDto } from "src/common/dtos/pagination.dto";

export class FetchUsersDto extends PaginationDto {
  @ApiPropertyOptional()
  @IsOptional()  
  @IsEmail()
  email: string;
}