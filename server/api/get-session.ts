import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);

    const sessionId = query.session_id as string;

    if (!sessionId) {
      throw createError({
        statusCode: 400,
        message: 'Session ID is required',
      });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['line_items', 'customer_details'],
    });

    return session;
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      message: error.message,
    });
  }
});
