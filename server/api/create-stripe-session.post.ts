import Stripe from 'stripe';
import { getCurrentUser } from '~/utils/users';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const authUser = event.context.auth;

    const session = await stripe.checkout.sessions.create({
      submit_type: 'pay', // submit button text (book, pay, subscribe, etc.)
      payment_method_types: ['card', 'us_bank_account', 'link'], // customizable UI from Stripe Dashboard
      line_items: body.items.map((item) => ({
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
      customer_email: authUser.email,
      shipping_address_collection: {
        allowed_countries: ['US', 'CA'], // Limit to specific countries (e.g., US, Canada)
      },
      shipping_options: [
        {
          shipping_rate_data: {
            type: 'fixed_amount', // Specify type as 'fixed_amount'
            fixed_amount: {
              amount: 340, // amount in cents ($34.00 shipping)
              currency: 'usd',
            },
            display_name: 'Standard Shipping',
            delivery_estimate: {
              minimum: {
                unit: 'day',
                value: 3, // Minimum shipping days
              },
              maximum: {
                unit: 'day',
                value: 7, // Maximum shipping days
              },
            },
          },
        },
        {
          shipping_rate_data: {
            type: 'fixed_amount', // Specify type as 'fixed_amount'
            fixed_amount: {
              amount: 700, // amount in cents ($70.00 shipping)
              currency: 'usd',
            },
            display_name: 'Express Shipping',
            delivery_estimate: {
              minimum: {
                unit: 'day',
                value: 1, // Minimum shipping days
              },
              maximum: {
                unit: 'day',
                value: 2, // Maximum shipping days
              },
            },
          },
        },
      ],
      phone_number_collection: {
        enabled: true,
      },
      discounts: [
        {
          coupon: '3bE87Wvr', // Need to pass id of coupon code
        },
      ],
    });

    return { url: session.url };
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      message: error.message,
    });
  }
});
