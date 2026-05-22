import { fetchAndGenerateTests } from './cronService.js';

async function test() {
  console.log('Testing generation locally...');
  await fetchAndGenerateTests();
  console.log('Done testing.');
  process.exit(0);
}

test();
