<template>
  <div class="bg-white rounded-lg shadow-md overflow-hidden">
    <img
      :src="product.image"
      :alt="product.title"
      class="w-full h-36 object-cover"
    />
    <div class="p-4">
      <h3 class="font-semibold">{{ product.title }}</h3>
      <p class="text-gray-600">${{ product.price.toFixed(2) }}</p>
      <div class="flex items-center mt-2">
        <button @click="emit('decrease')" class="px-2 py-1 bg-gray-200 rounded">
          -
        </button>
        <span class="mx-4">{{ product.quantity }}</span>
        <button @click="emit('increase')" class="px-2 py-1 bg-gray-200 rounded">
          +
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  product: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(['increase', 'decrease']);
</script>
