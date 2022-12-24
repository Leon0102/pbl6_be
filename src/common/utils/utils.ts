import { ReservationType } from '@common/types/reservations.type';
import { chain, reduce } from 'lodash';
export const getDaysDuration = (startDate: Date, endDate: Date) => {
  return Math.floor(
    (endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24)
  );
};
export const getReservationPrice = (
  checkOut: Date,
  checkIn: Date,
  price: number,
  numberOfRooms: number
) => {
  return getDaysDuration(checkIn, checkOut) * price * numberOfRooms;
};

export const getRevenue = (
  reservations: Array<ReservationType>,
  byMonth: boolean
) => {
  const result = chain(reservations)
    .filter(filter_by => filter_by.status === 'CONFIRMED')
    .sortBy(res => res.createdAt)
    .groupBy(res => res.createdAt.toISOString().substring(0, byMonth ? 7 : 10))
    .map((value, key) => ({
      date: key,
      value: reduce(
        value,
        (sum, n) => {
          return sum + n.totalPrice;
        },
        0
      )
    }))
    .value();

  return result;
};
