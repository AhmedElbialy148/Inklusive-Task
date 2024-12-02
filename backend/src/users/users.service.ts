import { BadRequestException, forwardRef, Inject, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateCurrentUserDto, UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { FetchUsersDto } from './dto/fetch-users.dto';
import { AuthenticatedUser } from 'src/common/interfaces/authenticated-user.interface';
import { RoleEnum, UserStatusEnum } from 'src/common/enums';
import { hashData } from 'src/common/helpers/password.helper';
import { UpdateUserCredentialsDto } from './dto/update-user-credentials.dto';
import { EmailService } from 'src/email/email.service';
import { ConfigService } from '@nestjs/config';
import { NotificationService } from 'src/notification/notification.service';
import * as argon2 from 'argon2';
import { SocketServeice } from 'src/websocket/socket.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private usersRepo: Repository<User>,
    private readonly configService: ConfigService,
    private readonly emailService: EmailService,
    @Inject(forwardRef(() => NotificationService))
    private readonly notificationService: NotificationService,
    private readonly socketGateway: SocketServeice
  ) {
    // Create a super-admin user on startup
    this.checkSuperAdmin();
  }
  
  async checkSuperAdmin() {
    let superAdminEmail = this.configService.get('SUPER_ADMIN_EMAIL');
    let superAdminUsername = this.configService.get('SUPER_ADMIN_USERNAME');
    let existing = await this.usersRepo.findOne({ where: { role: RoleEnum.SUPER_ADMIN } });
    let newSuperAdmin = null;
    // If super admin does not exist
    if (!existing) {
      let hashedPassword = await hashData(this.configService.get('SUPER_ADMIN_PASSWORD'));
      return this.createSuperAdmin(superAdminUsername, superAdminEmail, hashedPassword);
    }
    
    // Chicking if super admin credentials are changed
    let passwordMatch = await argon2.verify(existing.password, this.configService.get('SUPER_ADMIN_PASSWORD')); 
    if (
      (existing && existing.email !== superAdminEmail)
      || (existing && !passwordMatch)
      || (existing && existing.username !== superAdminUsername)
    ) {
      // Delete old super admin record
      let hashedPassword = await hashData(this.configService.get('SUPER_ADMIN_PASSWORD'));
      await this.usersRepo.delete({ role: RoleEnum.SUPER_ADMIN });
      newSuperAdmin = await this.createSuperAdmin(superAdminUsername, superAdminEmail, hashedPassword);
    };
    return newSuperAdmin || existing;
   }
   async createSuperAdmin(username: string, email: string, hashedPassword) {
    let superAdmin = this.usersRepo.create({
      role: RoleEnum.SUPER_ADMIN,
      username,
      email,
      password: hashedPassword,
      status: UserStatusEnum.ACTIVE
    })
    let newSuperAdmin = await this.usersRepo.save(superAdmin);
    console.log('Super-admin created successfully');
    return newSuperAdmin;
  }
  
  async create(createUserDto: CreateUserDto) {
    // Check if user email exist
    let existingUser = await this.usersRepo.findOne({ where: { email: createUserDto.email } });
    if (existingUser) throw new BadRequestException('User email already exists');
    
    // Hash pssword
    let hashedPassword = await hashData(createUserDto.password);
    // Create user
    let user = this.usersRepo.create({
      ...createUserDto,
      password: hashedPassword,
      status: UserStatusEnum.INACTIVE
    });
    user = await this.usersRepo.save(user);

    // Send email to the user with account credentials
    this.emailService.sendAccountCreationEmail({ email: createUserDto.email, password: createUserDto.password });

    return { message: 'User created successfully' };
  }

  async findAll({ page = 1, perPage = 10, ...filters }: FetchUsersDto, currentUserId: string) {
    const [users, total] = await this.usersRepo.findAndCount({
      where: filters,
      select: ['id', 'username', 'email', 'phoneNumber', 'role', 'status' , 'refreshToken'],
      skip: (page - 1) * perPage,
      take: perPage,
    });
    return {
      data: users,
      total,
      page,
      perPage,
      totalPages: Math.ceil(total / perPage),
      currentUserId: currentUserId
    };
  }

  async findOneById(id: string) {
    if (Number.isNaN(+id)) throw new BadRequestException('User id must be a number');
    
    let user = await this.usersRepo.findOne({ where: { id: +id } });
    if (!user) throw new BadRequestException('User does not exist');
    return user;
  }

  async findOneByEmail(email: string) {
    return this.usersRepo.findOne({ where: { email } });
  }

  async findCurrentUser(id: string) {
    // Check if user has been deleted
    let user = await this.usersRepo.findOne({ where: { id: +id } });
    if (!user) throw new BadRequestException('User has been deleted');

    return this.usersRepo.findOne({
      where: { id: +id },
    });
  }

  async updateUserById(id: string, updateUserDto: UpdateUserDto, currentUser: AuthenticatedUser) {
    if (Number.isNaN(+id)) throw new BadRequestException('User id must be a number');

    // Check if user exists
    let user = await this.usersRepo.findOne({ where: { id: +id } });
    if (!user) throw new BadRequestException('User does not exist');

    // Update user data
    await this.usersRepo.update(id, updateUserDto);
    let updatedUser = await this.usersRepo.findOne({ where: { id: +id } });
    delete updatedUser.password;
    // Get suber admin details
    let superAdmin = await this.usersRepo.findOne({ where: { id: +currentUser.sub } });
    // create notification for the admin with the updates
    await this.notificationService.create(
      { receiver: user, message: `Super admin ${superAdmin.username} has updated your profile` },
    );
    let notifications = await this.notificationService.getCurrentUserNotifications(user.id.toString(), { page: 1, perPage: 10 });

    // Emit updates to the client for real-time updates
    this.socketGateway.broadcast('super-admin-update', { id: user.id, updatedData: updatedUser, notifications });
    return { message: 'User updated successfully' };
  }

  async updateCurrentUser(updateUserDto: UpdateCurrentUserDto, currentUser: AuthenticatedUser) {
    // Check if user has been deleted
    let user = await this.usersRepo.findOne({ where: { id: +currentUser.sub } });
    if (!user) throw new BadRequestException('User has been deleted');

    // Update user data
    await this.usersRepo.update(currentUser.sub, updateUserDto);
    let updatedUser = await this.usersRepo.findOne({ where: { id: +currentUser.sub } });

    // Emit updates to the client for real-time updates
    this.socketGateway.broadcast('admin-update', { id: updatedUser.id, updatedData: updatedUser });

    // return updated user data
    return updatedUser
  }

  async updateUserCredentials(userId: string, newData: UpdateUserCredentialsDto) {
    // Check if user exists
    if (Number.isNaN(+userId)) throw new BadRequestException('User id must be a number');
    let user = await this.usersRepo.findOne({ where: { id: +userId } });
    if (!user) throw new BadRequestException('User does not exist');

    // Hash password
    if (newData.password) {
      newData.password = await hashData(newData.password);
    }
    // Update user data
    await this.usersRepo.update(userId, newData);
    return { message: 'User updated successfully' };
  }

  async remove(id: string) {
    let userId = +id;
    if (Number.isNaN(userId)) throw new BadRequestException('User id must be a number');
    
    // Using (findOne + remove) instead of (delete) in case of using entity hooks
    let user = await this.usersRepo.findOne({ where: { id: userId } });
    return this.usersRepo.remove(user);
  }
}
