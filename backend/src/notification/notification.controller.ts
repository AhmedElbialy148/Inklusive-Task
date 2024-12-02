import { Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AccessTokenGuard } from 'src/common/guards/access-token.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { AuthenticatedUser } from 'src/common/interfaces/authenticated-user.interface';
import { FilterUserNotificationsDto } from './dtos/filter-user-notifications.dto';


@Controller('notifications')
@ApiTags('Notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get('me')
  @ApiBearerAuth()
  @UseGuards(AccessTokenGuard)
  getCurrentUserNotifications(
    @CurrentUser() user: AuthenticatedUser,
    @Query() filterUserNotificationsDto: FilterUserNotificationsDto,
  ) {
    return this.notificationService.getCurrentUserNotifications(
      user.sub,
      filterUserNotificationsDto,
    );
  }
}
