import { ref } from 'vue';
import { loadStripe } from '@stripe/stripe-js';

export function useStripe() {
  // https://docs.stripe.com/elements/appearance-api
  const appearance = {
    theme: 'flat',
    variables: {
      fontWeightNormal: '700',

      colorText: '#3b82f6',
      colorTextSecondary: '#a21caf',
    },
    rules: {
      '.Input': {
        backgroundColor: '#d1d5db',
        border: '1px solid var(--colorPrimary)',
        borderRadius: '100px',
      },
    },
  };

  const stripe = ref(null);
  const elements = ref(null);
  const cardError = ref('');
  const clientSecret = ref('');

  const initializeStripe = async (cardElement, addressElement) => {
    stripe.value = await loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

    elements.value = stripe.value.elements({
      clientSecret: clientSecret.value,
      appearance,
    });

    // feel free to customize the payment element : https://docs.stripe.com/payments/payment-element
    // disable few payment option like link: https://dashboard.stripe.com/settings/payment_methods
    const card = elements.value.create('payment', {
      paymentMethodOptions: ['card'],
      defaultValues: {
        link: {
          enabled: false,
        },
      },
    });
    card.mount(cardElement);
    card.addEventListener('change', (event) => {
      cardError.value = event.error ? event.error.message : '';
    });

    const address = elements.value.create('address', {
      mode: 'shipping',
    });
    address.mount(addressElement);
    address.addEventListener('change', (event) => {
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

  const setClientSecret = (secret) => {
    clientSecret.value = secret;
  };

  const confirmPayment = async (params) => {
    return await stripe.value.confirmPayment({
      elements: elements.value, // Pass the Payment Element
      confirmParams: {},
      redirect: 'if_required', // if you don't pass this, then return url is required
      ...params, // Pass any additional parameters
    });
  };

  return {
    stripe,
    elements,
    cardError,
    initializeStripe,
    createPaymentIntent,
    confirmPayment,
    setClientSecret,
  };
}
