import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);

    const paymentIntent = await stripe.paymentIntents.create({
      // payment_method_types: ['card'], // This will remove all other payment method which are getting via create elements
      amount: body.amount,
      currency: body.currency,
      receipt_email: body.email,
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return {
      clientSecret: paymentIntent.client_secret,
    };
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message,
    });
  }
});
