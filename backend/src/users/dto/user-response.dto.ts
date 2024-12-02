import { Expose } from "class-transformer";
import { Notification } from "src/notification/entities/notification.entity";

export class UserResponseDto {
  @Expose()
  id: number;
  
  @Expose()
  username: string;
  
  @Expose()
  email: string;
  
  @Expose()
  phoneNumber: string;
  
  @Expose()
  role: string; 
  
  @Expose()
  notifications: Notification[];
  
  @Expose()
  refreshToken: string;
  
  @Expose()
  status: string;
}