import { Property, RoomType, User } from '@prisma/client';

export interface ReservationType {
  id: string;
  checkIn: Date;
  checkOut: Date;
  duration: number;
  status: string;
  roomsNumber: number;
  guestCount: number;
  specialRequest: string;
  totalPrice: number;
  createdAt: Date;
  user: Partial<User>;
  property: Partial<Property>;
  roomType: Partial<RoomType>;
}
