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
      <button
        @click="checkout"
        class="w-full mt-4 bg-green-200 text-black py-2 px-4 rounded hover:bg-green-100"
      >
        Proceed to Checkout
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

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

const checkout = async () => {
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

      // Redirect to Stripe Checkout
      if (data.value?.url) {
        window.location.href = data.value.url;
      }
    } catch (error) {
      console.error('Checkout error:', error);
      // Handle error appropriately
    }
  }
};
</script>
