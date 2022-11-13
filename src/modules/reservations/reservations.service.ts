import { Injectable, NotFoundException } from '@nestjs/common';
import { ReservationStatus, RoleType } from '@prisma/client';
import { db } from '../../common/utils/dbClient';
import { StatusReservation } from '../../constants';
import { CreateReservationDto } from './dto';

@Injectable()
export class ReservationsService {
    private readonly reservation = db.reservation;
    constructor(

    ) {}

    async createReservation(userId: number, dto: CreateReservationDto) {
        // create reservation with room id is get first room available from room type
        const room = await db.room.findFirst({
            where: {
                status: 'AVAILABLE',
                isActive: true,
                roomTypeId: dto.roomTypeId,
            },
            select: {
                id: true,
            },
        });

        if (!room) {
            throw new NotFoundException('Not found room available');
        }

        const reservation = await this.reservation.create({
            data: {
                checkIn: dto.checkIn,
                checkOut: dto.checkOut,
                specialRequest: dto.specialRequest,
                status: ReservationStatus.PENDING,
                roomReserved: {
                    connect: {
                        id: room.id,
                    }
                },
                user: {
                    connect: {
                        id: userId,
                    },
                },
            },
        });
        return {
            message: 'Create reservation success',
        }
    }

    async findAll() {
        return await this.reservation.findMany({
            include: {
                roomReserved: true,
                user: true,
            }
        });
    }

    async getReservationOfHost(userId: number) {
        // check if user is host
        const user = await db.user.findUnique({
            where: {
                id: userId,
            },
            select: {
                role: true,
            },
        });

        if (user.role.name !== RoleType.HOST) {
            throw new NotFoundException('User is not host');
        }
        // get reservation of all room of host
        const rooms = await db.property.findMany({
            where: {
                userId,
            },
            select: {
                roomTypes: {
                    select: {
                        rooms: {
                            select: {
                                id: true,
                                roomReserved: {
                                    select: {
                                        id: true,
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });
    }

    async cancelReservation(userId: number, id: number) {
        const reservation = await this.reservation.findUnique({
            where: {
                id,
            },
            select: {
                status: true,
                userId: true,
            }
        });

        if (!reservation) {
            throw new NotFoundException('Not found reservation');
        }

        if (reservation.userId !== userId) {
            throw new NotFoundException('Not found reservation');
        }

        if (reservation.status !== StatusReservation.PENDING) {
            throw new NotFoundException('Reservation is not pending');
        }

        await this.reservation.update({
            where: {
                id,
            },
            data: {
                status: ReservationStatus.CANCELLED,
            }
        });

        return {
            message: 'Cancel reservation success',
        }
    }

    async confirmReservation(userId: number, id: number) {
        const reservation = await this.reservation.findUnique({
            where: {
                id,
            },
            select: {
                status: true,
                userId: true,
            }
        });

        if (!reservation) {
            throw new NotFoundException('Not found reservation');
        }

        if (reservation.userId !== userId) {
            throw new NotFoundException('Not found reservation');
        }

        if (reservation.status !== StatusReservation.PENDING) {
            throw new NotFoundException('Reservation is not pending');
        }

        await this.reservation.update({
            where: {
                id,
            },
            data: {
                status: ReservationStatus.CONFIRMED,
            }
        });

        return {
            message: 'Confirm reservation success',
        }
    }
}
