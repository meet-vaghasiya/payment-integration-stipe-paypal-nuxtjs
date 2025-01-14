<template>
  <div class="flex">
    <aside class="w-1/4 min-h-svh p-4 bg-green-300">
      <h2 class="font-bold text-lg">Menu</h2>
      <ul>
        <li v-for="(item, index) in menuItems" :key="index" class="py-2">
          <NuxtLink :to="item.link">{{ item.title }}</NuxtLink>
        </li>
      </ul>
    </aside>
    <main class="flex-1 p-4">
      <slot />
    </main>
  </div>
</template>

<script setup>
const menuItems = [
  { title: 'One Time Payment', link: '/one-time-payment' },
  { title: 'Subscriptions', link: '/subscriptions' },
  { title: 'Promocode List', link: '/promocode-list' },
];
</script>
