<template>
  <div class="text-sm">
    <h1 class="text-2xl font-bold mb-4">One Time Payment</h1>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <ProductCard
        v-for="product in products"
        :key="product.id"
        :product="product"
        @increase="increaseQuantity(product)"
        @decrease="decreaseQuantity(product)"
      />
    </div>

    <CartSummary
      :items="cartItems"
      :total="total"
      @stripe-checkout="checkoutWithStripe"
      @custom-checkout="handleCustomCheckoutProcess"
      @full-customize-checkout="handleFullyCustomCheckoutProcess"
    />
    <CheckoutModal
      v-model:show="showCustomCheckout"
      v-model:cardName="cardName"
      v-model:email="email"
      :error="cardError"
      :processing="processing"
      :total="total"
      @close="showCustomCheckout = false"
      @submit="processCustomCheckout"
      ref="checkoutModalRef"
      v-if="showCustomCheckout"
    />
    <CheckoutFullyCustomizeCheckout
      v-model:show="showFullyCustomCheckout"
      v-model:cardName="cardName"
      v-model:email="email"
      :error="cardError"
      :processing="processing"
      :total="total"
      @close="showFullyCustomCheckout = false"
      @submit="processFullyCustomCheckout"
      @full-customize-checkout="showFullyCustomCheckout = true"
      ref="fullyCustomCheckoutRef"
      v-if="showFullyCustomCheckout"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useStripe } from '~/composables/useStripe';

const router = useRouter();
const checkoutModalRef = ref(null);
const fullyCustomCheckoutRef = ref(null);
const showCustomCheckout = ref(false);
const showFullyCustomCheckout = ref(false);
const processing = ref(false);
const cardName = ref('');
const userStore = useUserStore();
const email = ref(userStore.selectedUser.email);

const {
  cardError,
  initializeStripe,
  createPaymentIntent,
  createCustomizedPaymentIntent,
  confirmPayment,
  confirmCardPayment,
  elements,
  setClientSecret,
  initializeStripeForFullyCustomCheckout,
} = useStripe();

// Products and Cart Logic
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

const cartItems = computed(() => products.value.filter((p) => p.quantity > 0));
const total = computed(() =>
  cartItems.value.reduce((sum, p) => sum + p.price * p.quantity, 0)
);

const increaseQuantity = (product) => product.quantity++;
const decreaseQuantity = (product) => {
  if (product.quantity > 0) product.quantity--;
};

const checkoutWithStripe = async () => {
  if (total.value <= 0) {
    alert('Kindly select product first');
    return;
  }

  try {
    const { data, error } = await useFetch('/api/create-stripe-session', {
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
    if (error.value) {
      const errorMessage = error.value?.data?.message || 'Something went wrong';
      alert(errorMessage);
      return;
    }

    if (data.value?.url) {
      window.location.href = data.value.url;
    }
  } catch (error) {
    console.error('Checkout error:', error);
  }
};

const handleCustomCheckoutProcess = async () => {
  // create payment intent
  if (!total.value) {
    alert('Kindly select product first');
    return;
  }
  const paymentIntent = await createPaymentIntent(total.value, email.value);
  if (!paymentIntent?.clientSecret) {
    throw new Error('Failed to create payment intent');
  }
  setClientSecret(paymentIntent.clientSecret);

  showCustomCheckout.value = true;

  await nextTick();
  await initializeStripe(
    checkoutModalRef.value.cardElementRef,
    checkoutModalRef.value.addressElementRef
  );
};

const handleFullyCustomCheckoutProcess = async () => {
  // create payment intent
  if (!total.value) {
    alert('Kindly select product first');
    return;
  }
  const paymentIntent = await createCustomizedPaymentIntent(
    total.value,
    email.value
  );
  if (!paymentIntent?.clientSecret) {
    throw new Error('Failed to create payment intent');
  }
  setClientSecret(paymentIntent.clientSecret);

  showFullyCustomCheckout.value = true;

  await nextTick();
  await initializeStripeForFullyCustomCheckout({
    cardEl: fullyCustomCheckoutRef.value.cardElementRef,
    cardNumberEl: fullyCustomCheckoutRef.value.cardNumberElementRef,
    cardExpiryEl: fullyCustomCheckoutRef.value.cardExpiryElementRef,
    cardCvcEl: fullyCustomCheckoutRef.value.cardCvcElementRef,
  });
};

const processCustomCheckout = async () => {
  if (processing.value) return;

  processing.value = true;
  try {
    const { error, paymentIntent: confirmedPayment } = await confirmPayment();
    if (error) throw new Error(error.message);

    if (confirmedPayment.status === 'succeeded') {
      alert('success');
      showCustomCheckout.value = false;
    }
  } catch (error) {
    cardError.value = error.message;
  } finally {
    processing.value = false;
  }
};

const processFullyCustomCheckout = async () => {
  if (processing.value) return;

  processing.value = true;
  try {
    const { error, paymentIntent: confirmedPayment } =
      await confirmCardPayment();
    if (error) throw new Error(error.message);

    if (confirmedPayment.status === 'succeeded') {
      alert('success');
      showCustomCheckout.value = false;
    }
  } catch (error) {
    cardError.value = error.message;
  } finally {
    processing.value = false;
  }
};
</script>
