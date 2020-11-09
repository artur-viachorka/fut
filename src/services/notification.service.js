import { sleep } from './helper.service';

export const openUTNotification = async ({ text, success, error }) => {
  const notificationType = success ? 'positive': error ? 'negative' : 'neutral';
  const notification = $(`<div class="Notification ${notificationType} fade-in"><p>${text}</p></div>`);
  const closeButton = $('<span class="icon_close fut_icon"></span>').on('click', () => notification.remove());
  notification.append(closeButton);
  $('#NotificationLayer').css('z-index', 1000).append(notification);
  await sleep(3);
  notification.remove();
};
