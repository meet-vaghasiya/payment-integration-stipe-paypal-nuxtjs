import { getCurrentUser } from '~/utils/users';

export default defineEventHandler((event) => {
  const userId = getCookie(event, 'userId') || '1';
  const user = getCurrentUser(parseInt(userId, 10));
  event.context.auth = user;
});
