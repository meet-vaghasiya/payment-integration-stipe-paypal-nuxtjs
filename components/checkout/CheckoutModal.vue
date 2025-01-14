<template>
  <div
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
  >
    <div class="bg-white p-6 rounded-lg w-full max-w-md">
      <h2 class="text-xl font-semibold mb-4">Checkout</h2>
      <form @submit.prevent="emit('submit')">
        <div class="mb-4">
          <label class="block text-sm font-medium mb-1">Card Number</label>
          <div ref="cardElementRef" class="p-3 border rounded"></div>
          <p v-if="error" class="mt-1 text-red-500 text-sm">
            {{ error }}
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
            @click="emit('close')"
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
</template>

<script setup>
const props = defineProps({
  show: Boolean,
  error: String,
  processing: Boolean,
  total: Number,
  cardName: String,
  email: String,
});

const emit = defineEmits([
  'close',
  'submit',
  'update:cardName',
  'update:email',
]);

const cardElementRef = ref(null);
const cardName = useVModel(props, 'cardName', emit);
const email = useVModel(props, 'email', emit);

defineExpose({ cardElementRef });
</script>
