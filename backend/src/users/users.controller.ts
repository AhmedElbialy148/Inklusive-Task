import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateCurrentUserDto, UpdateUserDto } from './dto/update-user.dto';
import { FetchUsersDto } from './dto/fetch-users.dto';
import { AccessTokenGuard } from 'src/common/guards/access-token.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RoleEnum } from 'src/common/enums';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { AuthenticatedUser } from 'src/common/interfaces/authenticated-user.interface';
import { ApiParam, ApiTags } from '@nestjs/swagger';
import { Serialize } from 'src/common/interceptors/serializer';
import { UserResponseDto } from './dto/user-response.dto';

@ApiTags('User')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(RoleEnum.SUPER_ADMIN)
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @UseGuards(AccessTokenGuard)
  findAll(@Query() fetchUsersDto: FetchUsersDto, @CurrentUser() currentUser: AuthenticatedUser) {
    return this.usersService.findAll(fetchUsersDto, currentUser.sub);
  }

  @Get('me')
  @UseGuards(AccessTokenGuard)
  @Serialize(UserResponseDto)
  findMyData(@CurrentUser() CurrentUser: AuthenticatedUser) {
    return this.usersService.findCurrentUser(CurrentUser.sub);
  }

  @Get(':id')
  @UseGuards(AccessTokenGuard)
  @Serialize(UserResponseDto)
  @ApiParam({ name: 'id', type: 'string', required: true })
  findOne(@Param('id') id: string) {
    return this.usersService.findOneById(id);
  }

  @Patch('me')
  @UseGuards(AccessTokenGuard)
  @Serialize(UserResponseDto)
  updateCurrentUser(@Body() updateUserDto: UpdateCurrentUserDto, @CurrentUser() currentUser: AuthenticatedUser) {
    return this.usersService.updateCurrentUser(updateUserDto, currentUser);
  }

  @Patch(':id')
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(RoleEnum.SUPER_ADMIN)
  updateUserById(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto, @CurrentUser() currentUser: AuthenticatedUser) {
    return this.usersService.updateUserById(id, updateUserDto, currentUser);
  }

  @Delete(':id')
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(RoleEnum.SUPER_ADMIN)
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
