<template>
  <div class="text-sm">
    <h1 class="text-2xl font-bold mb-4">One Time Payment</h1>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <!-- Product Cards -->
      <div
        v-for="product in products"
        :key="product.id"
        class="bg-white rounded-lg shadow-md overflow-hidden"
      >
        <img
          :src="product.image"
          :alt="product.title"
          class="w-full h-36 object-cover"
        />
        <div class="p-4">
          <h3 class="font-semibold">{{ product.title }}</h3>
          <p class="text-gray-600">${{ product.price.toFixed(2) }}</p>
          <div class="flex items-center mt-2">
            <button
              @click="decreaseQuantity(product)"
              class="px-2 py-1 bg-gray-200 rounded"
            >
              -
            </button>
            <span class="mx-4">{{ product.quantity }}</span>
            <button
              @click="increaseQuantity(product)"
              class="px-2 py-1 bg-gray-200 rounded"
            >
              +
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Cart Summary -->
    <div class="mt-8 bg-white p-4 rounded-lg">
      <h2 class="text-xl font-semibold mb-4">Cart Summary</h2>
      <div
        v-for="product in cartItems"
        :key="product.id"
        class="flex justify-between mb-2"
      >
        <span>{{ product.title }} (x{{ product.quantity }})</span>
        <span>${{ (product.price * product.quantity).toFixed(2) }}</span>
      </div>
      <div class="border-t border-gray-200 mt-4 pt-4">
        <div class="flex justify-between font-semibold">
          <span>Total:</span>
          <span>${{ total.toFixed(2) }}</span>
        </div>
      </div>
      <div class="flex gap-4">
        <button
          @click="checkoutWithStripe"
          class="flex-1 mt-4 bg-green-200 text-black py-2 px-4 rounded hover:bg-green-100"
        >
          Checkout with Stripe
        </button>
        <button
          @click="showCustomCheckout = true"
          class="flex-1 mt-4 bg-blue-200 text-black py-2 px-4 rounded hover:bg-blue-100"
        >
          Custom Checkout
        </button>
      </div>
    </div>

    <!-- Custom Checkout Modal -->
    <div
      v-if="showCustomCheckout"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
    >
      <div class="bg-white p-6 rounded-lg w-full max-w-md">
        <h2 class="text-xl font-semibold mb-4">Checkout</h2>
        <form @submit.prevent="processCustomCheckout">
          <div class="mb-4">
            <label class="block text-sm font-medium mb-1">Card Number</label>
            <div ref="cardElement" class="p-3 border rounded"></div>
            <p v-if="cardError" class="mt-1 text-red-500 text-sm">
              {{ cardError }}
            </p>
          </div>

          <div class="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label class="block text-sm font-medium mb-1">Name on Card</label>
              <input
                v-model="cardName"
                type="text"
                class="w-full p-2 border rounded"
                required
              />
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">Email</label>
              <input
                v-model="email"
                type="email"
                class="w-full p-2 border rounded"
                required
              />
            </div>
          </div>

          <div class="flex justify-end gap-4">
            <button
              type="button"
              @click="showCustomCheckout = false"
              class="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="processing"
              class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {{ processing ? 'Processing...' : `Pay $${total.toFixed(2)}` }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { loadStripe } from '@stripe/stripe-js';

const router = useRouter();
const stripe = ref(null);
const elements = ref(null);
const cardElement = ref(null);
const showCustomCheckout = ref(false);
const cardError = ref('');
const processing = ref(false);
const cardName = ref('');
const email = ref('');

const products = ref([]);

const { data } = await useFetch('https://fakestoreapi.com/products?limit=4');

watchEffect(() => {
  if (data.value) {
    products.value = data.value.map((product) => ({
      id: product.id,
      title: product.title,
      price: product.price,
      image: product.image,
      quantity: 0,
    }));
  }
});

const cartItems = computed(() => {
  return products.value.filter((product) => product.quantity > 0);
});

const total = computed(() => {
  return cartItems.value.reduce(
    (sum, product) => sum + product.price * product.quantity,
    0
  );
});

const increaseQuantity = (product) => {
  product.quantity++;
};

const decreaseQuantity = (product) => {
  if (product.quantity > 0) {
    product.quantity--;
  }
};

// Initialize Stripe
watch(showCustomCheckout, async () => {
  stripe.value = await loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);
  elements.value = stripe.value.elements();
  const card = elements.value.create('card');
  console.log('card el', cardElement.value);
  card.mount(cardElement.value);

  card.addEventListener('change', (event) => {
    cardError.value = event.error ? event.error.message : '';
  });
});

// Original Stripe checkout
const checkoutWithStripe = async () => {
  if (total.value > 0) {
    try {
      const { data } = await useFetch('/api/create-stripe-session', {
        method: 'POST',
        body: {
          total: total.value,
          currency: 'usd',
          items: cartItems.value.map((item) => ({
            id: item.id,
            title: item.title,
            price: item.price,
            quantity: item.quantity,
          })),
        },
      });

      if (data.value?.url) {
        window.location.href = data.value.url;
      }
    } catch (error) {
      console.error('Checkout error:', error);
    }
  }
};

// Custom checkout process
const processCustomCheckout = async () => {
  if (processing.value) return;

  processing.value = true;
  try {
    // Create payment intent
    const { data: paymentIntent } = await useFetch(
      '/api/create-payment-intent',
      {
        method: 'POST',
        body: {
          amount: Math.round(total.value * 100), // Convert to cents
          currency: 'usd',
          email: email.value,
        },
      }
    );

    if (!paymentIntent.value?.clientSecret) {
      throw new Error('Failed to create payment intent');
    }

    // Confirm card payment
    const { error, paymentIntent: confirmedPayment } =
      await stripe.value.confirmCardPayment(paymentIntent.value.clientSecret, {
        payment_method: {
          card: elements.value.getElement('card'),
          billing_details: {
            name: cardName.value,
            email: email.value,
          },
        },
      });

    if (error) {
      throw new Error(error.message);
    }

    if (confirmedPayment.status === 'succeeded') {
      // Handle successful payment
      router.push('/success');
    }
  } catch (error) {
    cardError.value = error.message;
  } finally {
    processing.value = false;
  }
};
</script>
