import { defineStore } from 'pinia';
import { users } from '~/utils/users';

export const useUserStore = defineStore('user', {
  state: () => ({
    users,

    selectedUserId: 1,
  }),

  actions: {
    async setSelectedUserId(userId: number): Promise<void> {
      this.selectedUserId = userId;

      // Set the cookie on the server by calling an API
      await $fetch('/api/set-user-id', {
        method: 'POST',
        body: { userId },
      });
    },
  },

  getters: {
    selectedUser(state) {
      // Return the user object based on selectedUserId
      return (
        state.users.find((user) => user.id === state.selectedUserId) || null
      );
    },
  },
});
