import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { RoleEnum } from "src/common/enums";
import { Notification } from "src/notification/entities/notification.entity";
import { Exclude } from "class-transformer";

@Entity({ name: "users" })
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false, unique: true })
  email: string;

  @Column({ nullable: false })
  @Exclude()
  password: string;

  @Column({ nullable: false })
  username: string;

  @Column({ nullable: true })
  phoneNumber: string;

  @Column({ default: RoleEnum.ADMIN })
  role: string;

  @Column()
  status: string;

  @OneToMany(() => Notification, (notification) => notification.receiver)
  notifications: Notification[];

  @Column({ default: null })
  refreshToken: string;

  @Column({ default: false })
  is2FAVerified: boolean;

  @Column({ default: null })
  otp: string;

  @Column({ default: null })
  otpExpiresAt: Date;

  @Column({ default: new Date() })
  createdAt: Date;
 }
