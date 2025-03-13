import { run } from 'jest';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

run([process.argv[2] || 'tests/unit/FileManager.test.js'], __dirname)
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error(error);
    process.exit(1);
  });