export const getReservationPrice = (
  checkOut: Date,
  checkIn: Date,
  price: number,
  numberOfRooms: number
) => {
  return (
    Math.floor((checkOut.getTime() - checkIn.getTime()) / (1000 * 3600 * 24)) *
    price *
    numberOfRooms
  );
};
