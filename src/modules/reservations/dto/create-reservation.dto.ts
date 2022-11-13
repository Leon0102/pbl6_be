export class CreateReservationDto {

    roomTypeId: number;

    checkIn: Date;

    checkOut: Date;

    specialRequest?: string;
}
