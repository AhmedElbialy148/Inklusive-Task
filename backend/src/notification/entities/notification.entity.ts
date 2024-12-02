import { User } from "src/users/entities/user.entity";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: 'notifications' })
export class Notification {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.notifications)
  receiver: User;

  @Column({ nullable: false })
  message: string;

  @Column({ default: null})
  readAt: Date;

  @Column({ default: new Date() })
  createdAt: Date;
 }