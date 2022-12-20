import { CategoriesVietnamese } from '@common/constants/category-type.enum';
import { NotificationType } from '@prisma/client';

export const getNotificationContent = (type: NotificationType, data: any) => {
  switch (type) {
    case NotificationType.PAID_RESERVATION_SUCCESS:
      return `Bạn đã thanh toán đặt phòng thành công tại ${
        CategoriesVietnamese[data.categoryId]
      } ${data.name}.`;
    case NotificationType.FROM_ADMIN:
      return `${data.title} - ${data.body}`;
    case NotificationType.CREATED_RESERVATION_FAILED:
      return `Your reservation at ${data.property} has failed.`;
    case NotificationType.UPDATED_RESERVATION_SUCCESS:
      return `Your reservation at ${data.property} has been updated successfully.`;
    default:
      return '';
  }
};
