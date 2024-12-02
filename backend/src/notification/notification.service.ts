import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { CreateNotificationDto } from './dtos/create-notification.dto';
import { AuthenticatedUser } from 'src/common/interfaces/authenticated-user.interface';
import { FilterUserNotificationsDto } from './dtos/filter-user-notifications.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification) private notificationRepo: Repository<Notification>,
    @Inject(forwardRef(() => UsersService))
    private usersService: UsersService,
  ) {}

  async create( { receiver, message }: CreateNotificationDto ) {
    const notification = this.notificationRepo.create({
      receiver,
      message
    })
    const createdNotification = await this.notificationRepo.save(notification);

    return createdNotification;
  }

  async getCurrentUserNotifications(
    userId: string,
    { page = 1, perPage = 10 }: FilterUserNotificationsDto,
  ) {
    let currentUser = await this.usersService.findOneById(userId);
    const [notifications, total] = await this.notificationRepo.findAndCount({
      where: { receiver: currentUser },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * perPage,
      take: perPage,
    });
    return {
      data: notifications,
      total,
      page,
      perPage,
      totalPages: Math.ceil(total / perPage),
    };
  }

}
