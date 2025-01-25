<template>
  <div class="mt-8 bg-white p-4 rounded-lg">
    <h2 class="text-xl font-semibold mb-4">Cart Summary</h2>
    <div v-for="item in items" :key="item.id" class="flex justify-between mb-2">
      <span>{{ item.title }} (x{{ item.quantity }})</span>
      <span>${{ (item.price * item.quantity).toFixed(2) }}</span>
    </div>
    <div class="border-t border-gray-200 mt-4 pt-4">
      <div class="flex justify-between font-semibold">
        <span>Total:</span>
        <span>${{ total.toFixed(2) }}</span>
      </div>
    </div>
    <div class="flex gap-4">
      <button
        @click="emit('stripe-checkout')"
        class="flex-1 mt-4 bg-green-200 text-black py-2 px-4 rounded hover:bg-green-100"
      >
        Checkout with Stripe
      </button>
      <button
        @click="emit('custom-checkout')"
        class="flex-1 mt-4 bg-blue-200 text-black py-2 px-4 rounded hover:bg-blue-100"
      >
        Custom Checkout
      </button>
      <button
        class="flex-1 mt-4 bg-blue-200 text-black py-2 px-4 rounded hover:bg-blue-100"
        @click="emit('full-customize-checkout')"
      >
        Fully Customized Checkout
      </button>
      <button
        class="flex-1 mt-4 bg-blue-200 text-black py-2 px-4 rounded hover:bg-blue-100"
      >
        Using saved card
      </button>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  items: {
    type: Array,
    required: true,
  },
  total: {
    type: Number,
    required: true,
  },
});

const emit = defineEmits([
  'stripe-checkout',
  'custom-checkout',
  'full-customize-checkout',
]);
</script>
