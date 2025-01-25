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

  const initializeStripeForFullyCustomCheckout = async ({
    cardEl,
    cardNumberEl,
    cardExpiryEl,
    cardCvcEl,
  }) => {
    stripe.value = await loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);
    // Initialize Elements with custom styles
    const customStyle = {
      base: {
        color: '#3b82f6', // Text color (blue)
        fontFamily: '"Helvetica Neue", Helvetica, sans-serif', // Font family
        fontSmoothing: 'antialiased', // Font smoothing
        fontSize: '16px', // Font size
        '::placeholder': {
          color: '#93c5fd', // Placeholder color (lighter blue)
        },
        borderColor: '#3b82f6', // Border color (blue)
        border: '1px solid #3b82f6', // Border style
      },
      invalid: {
        color: '#fa755a', // Text color for invalid input
        iconColor: '#fa755a', // Icon color for invalid input
      },
    };

    elements.value = stripe.value.elements({
      clientSecret: clientSecret.value,
    });

    // https://docs.stripe.com/js/elements_object/create_element?type=cardNumber
    const cardNumberElement = elements.value.create('cardNumber', {
      style: customStyle,
    });
    const cardExpiryElement = elements.value.create('cardExpiry', {
      style: customStyle,
    });
    const cardCvcElement = elements.value.create('cardCvc', {
      style: customStyle,
    });

    cardNumberElement.mount(cardNumberEl);
    cardExpiryElement.mount(cardExpiryEl);
    cardCvcElement.mount(cardCvcEl);

    cardNumberElement.addEventListener('change', (event) => {
      cardError.value = event.error ? event.error.message : '';
    });
    cardExpiryElement.addEventListener('change', (event) => {
      cardError.value = event.error ? event.error.message : '';
    });
    cardCvcElement.addEventListener('change', (event) => {
      cardError.value = event.error ? event.error.message : '';
    });

    return { cardNumberElement, cardExpiryElement, cardCvcElement };
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

  const createCustomizedPaymentIntent = async (amount, email) => {
    const { data } = await useFetch(
      '/api/create-payment-intent-for-full-customize',
      {
        method: 'POST',
        body: {
          amount: Math.round(amount * 100),
          currency: 'usd',
          email,
        },
      }
    );
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
  const confirmCardPayment = async (params) => {
    return await stripe.value.confirmCardPayment(clientSecret.value, {
      payment_method: {
        card: elements.value.getElement('cardNumber'),
        billing_details: {
          name: 'Test Name',
        },
      },
    });
  };

  return {
    stripe,
    elements,
    cardError,
    initializeStripe,
    createPaymentIntent,
    createCustomizedPaymentIntent,
    confirmPayment,
    setClientSecret,
    initializeStripeForFullyCustomCheckout,
    confirmCardPayment,
  };
}
