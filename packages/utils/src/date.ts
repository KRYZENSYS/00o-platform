import dayjs from 'dayjs';
import 'dayjs/locale/uz';
import 'dayjs/locale/ru';
import 'dayjs/locale/en';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);
dayjs.locale('uz');

export const formatDate = (date: Date | string, format = 'DD MMM YYYY, HH:mm') => {
  return dayjs(date).format(format);
};

export const timeAgo = (date: Date | string) => {
  return dayjs(date).fromNow();
};

export { dayjs };
