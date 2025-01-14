<template>
  <div class="text-center">
    <div class="bg-white p-8 rounded-lg shadow-md max-w-2xl mx-auto">
      <!-- Success Icon -->
      <div class="mb-6">
        <div
          class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto"
        >
          <svg
            class="w-8 h-8 text-green-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M5 13l4 4L19 7"
            ></path>
          </svg>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="pending" class="animate-pulse">
        <div class="h-4 bg-gray-200 rounded w-3/4 mx-auto mb-4"></div>
        <div class="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="text-red-600">
        <p>Sorry, we couldn't load your order details.</p>
        <p class="text-sm">{{ error }}</p>
      </div>

      <!-- Success State -->
      <template v-else-if="session">
        <h1 class="text-2xl font-bold text-gray-800 mb-4">
          Thank You for Your Order!
        </h1>
        <p class="text-gray-600 mb-6">
          Your payment has been processed successfully
        </p>

        <!-- Order Details -->
        <div class="bg-gray-50 p-6 rounded-lg mb-6 text-left">
          <div class="grid grid-cols-2 gap-4">
            <div class="col-span-2 md:col-span-1">
              <p class="text-sm text-gray-600">Order ID</p>
              <p class="font-semibold break-all">{{ session.id }}</p>
            </div>
            <div class="col-span-2 md:col-span-1">
              <p class="text-sm text-gray-600">Date</p>
              <p class="font-semibold">{{ formatDate(session.created) }}</p>
            </div>
            <div class="col-span-2">
              <p class="text-sm text-gray-600">Email</p>
              <p class="font-semibold">{{ session.customer_details?.email }}</p>
            </div>
          </div>

          <!-- Payment Details -->
          <div class="mt-6 border-t border-gray-200 pt-6">
            <h3 class="font-semibold mb-4">Payment Details</h3>
            <div
              v-for="item in session.line_items?.data"
              :key="item.id"
              class="flex justify-between mb-2"
            >
              <span>{{ item.description }} (x{{ item.quantity }})</span>
              <span>${{ (item.amount_total / 100).toFixed(2) }}</span>
            </div>
            <div
              class="border-t border-gray-200 mt-4 pt-4 flex justify-between font-semibold"
            >
              <span>Total</span>
              <span>${{ (session.amount_total / 100).toFixed(2) }}</span>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <NuxtLink
            to="/one-time-payment"
            class="inline-block bg-blue-600 text-white py-2 px-6 rounded hover:bg-blue-700"
          >
            Continue Shopping
          </NuxtLink>
          <button
            @click="downloadInvoice"
            class="inline-block bg-gray-100 text-gray-700 py-2 px-6 rounded hover:bg-gray-200"
          >
            Download Invoice
          </button>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
const route = useRoute();
const sessionId = route.query.session_id;

const {
  data: session,
  pending,
  error,
} = await useFetch('/api/get-session', {
  query: { session_id: sessionId },
});

const formatDate = (timestamp) => {
  return new Date(timestamp * 1000).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const downloadInvoice = async () => {
  try {
    const response = await fetch(`/api/create-invoice?session_id=${sessionId}`);
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoice-${sessionId}.pdf`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
  } catch (err) {
    console.error('Error downloading invoice:', err);
  }
};
</script>
