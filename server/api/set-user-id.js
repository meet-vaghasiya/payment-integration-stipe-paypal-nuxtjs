// server/api/set-user-id.ts
import { defineEventHandler, setCookie } from 'h3';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const userId = body.userId;

  if (!userId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'User ID is required to set the cookie.',
    });
  }

  setCookie(event, 'userId', userId.toString(), {
    maxAge: 60 * 60 * 24 * 1,
  });

  return { success: true };
});
