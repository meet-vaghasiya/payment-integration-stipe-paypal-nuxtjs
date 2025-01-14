import { ref } from 'vue';
import { loadStripe } from '@stripe/stripe-js';

export function useStripe() {
  const stripe = ref(null);
  const elements = ref(null);
  const cardError = ref('');

  const initializeStripe = async (cardElement) => {
    stripe.value = await loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);
    elements.value = stripe.value.elements();
    const card = elements.value.create('card');
    card.mount(cardElement);

    card.addEventListener('change', (event) => {
      cardError.value = event.error ? event.error.message : '';
    });

    return { card, elements: elements.value };
  };

  const createPaymentIntent = async (amount, email) => {
    const { data } = await useFetch('/api/create-payment-intent', {
      method: 'POST',
      body: {
        amount: Math.round(amount * 100),
        currency: 'usd',
        email,
      },
    });
    return data.value;
  };

  const confirmPayment = async (clientSecret, paymentMethod) => {
    return await stripe.value.confirmCardPayment(clientSecret, {
      payment_method: paymentMethod,
    });
  };

  return {
    stripe,
    elements,
    cardError,
    initializeStripe,
    createPaymentIntent,
    confirmPayment,
  };
}
