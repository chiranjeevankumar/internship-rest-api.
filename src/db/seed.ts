import { getDatabase, seedDatabase, closeDatabase } from './database.js';

console.log('🌱 Seeding database...');
try {
  const db = getDatabase();
  const result = seedDatabase(db);
  console.log(`✅ Database seeding completed successfully!`);
  console.log(`   - New records inserted: ${result.seeded}`);
  console.log(`   - Total records in database: ${result.total}`);
} catch (error) {
  console.error('❌ Database seeding failed:', error);
  process.exit(1);
} finally {
  closeDatabase();
}
