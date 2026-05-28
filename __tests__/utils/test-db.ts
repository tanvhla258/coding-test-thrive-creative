export async function cleanupTestData() {
  // Cleanup handled by tracking created note IDs in tests
}

export async function cleanupAllTestData() {
  await cleanupTestData();
}
