import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: body.items.map((item: any) => ({
        price_data: {
          currency: 'usd',
          product_data: {
            name: item.title,
          },
          unit_amount: Math.round(item.price * 100), // Stripe expects amounts in cents
        },
        quantity: item.quantity,
      })),
      mode: 'payment',
      success_url: `${process.env.APP_URL}/order-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.APP_URL}/one-time-payment`,
      customer_email: 'asdfdsftest@test.com',
      phone_number_collection: {
        enabled: true,
      },
    });
    console.log(session);

    return { url: session.url };
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      message: error.message,
    });
  }
});
