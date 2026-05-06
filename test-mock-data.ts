import { generateMockActivities } from './src/utils/mock-data';

// Test the generateMockActivities function
const testActivities = generateMockActivities(2, 2026);
console.log('Generated activities:', testActivities.length);

// Check if tasks have mixed statuses
const firstActivity = testActivities[0];
if (firstActivity && firstActivity.tasks) {
  console.log('First activity tasks:');
  firstActivity.tasks.forEach((task, i) => {
    console.log(`  Task ${i+1}: ${task.title} - ${task.status}`);
  });
}

console.log('Test completed');