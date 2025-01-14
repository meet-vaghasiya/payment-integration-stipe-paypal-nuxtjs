<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useUserStore } from '../stores/user';

const userStore = useUserStore();
const { users, selectedUser } = storeToRefs(userStore);

const handleUserChange = (event: Event) => {
  const target = event.target as HTMLSelectElement;
  const selectedUserId = parseInt(target.value);
  userStore.setSelectedUserId(selectedUserId);
};

onMounted(() => {
  const userCookie = useCookie('userId');

  if (userCookie.value) {
    userStore.setSelectedUserId(parseInt(userCookie.value, 10));
  } else {
    userStore.setSelectedUserId(1);
  }
});
</script>

<template>
  <div class="bg-blue-400 white shadow">
    <div
      class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between"
    >
      <h1 class="text-lg font-bold text-gray-800">Payment System</h1>
      <div class="flex items-center space-x-2">
        <label for="user-select" class="text-sm font-medium text-gray-600">
          Current User:
        </label>
        <select
          id="user-select"
          class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          :value="userStore.selectedUserId"
          @change="handleUserChange"
        >
          <option v-for="user in users" :key="user.id" :value="user.id">
            {{ user.name }}
          </option>
        </select>
      </div>
    </div>
  </div>
</template>
