export const users = [
  { id: 1, name: 'John Doe', email: 'john.doe@example.com' },
  { id: 2, name: 'Jane Smith', email: 'jane.smith@example.com' },
  { id: 3, name: 'Alice Johnson', email: 'alice.johnson@example.com' },
  { id: 4, name: 'Bob Williams', email: 'bob.williams@example.com' },
  { id: 5, name: 'Charlie Brown', email: 'charlie.brown@example.com' },
  { id: 6, name: 'David Lee', email: 'david.lee@example.com' },
  { id: 7, name: 'Emily Chen', email: 'emily.chen@example.com' },
  { id: 8, name: 'Frank Taylor', email: 'frank.taylor@example.com' },
  { id: 9, name: 'George Martin', email: 'george.martin@example.com' },
  { id: 10, name: 'Helen White', email: 'helen.white@example.com' },
];

export const getCurrentUser = (userId: number) => {
  return users.find((user) => user.id === userId);
};
