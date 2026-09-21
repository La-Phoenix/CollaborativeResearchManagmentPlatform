import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import express from 'express';
import healthRoutes from '../routes/healthRoutes';

async function runHealthTest() {
  const app = express();
  app.use(healthRoutes);

  const server = createServer(app);

  await new Promise<void>((resolve) => {
    server.listen(0, resolve);
  });

  const address = server.address();
  if (!address || typeof address === 'string') {
    throw new Error('Failed to resolve test server address');
  }

  try {
    const response = await fetch(`http://127.0.0.1:${address.port}/health`);
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.deepEqual(body, { status: 'ok' });

    console.log('✅ Health endpoint test passed');
  } finally {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => {
        if (error) {
          reject(error);
          return;
        }
        resolve();
      });
    });
  }
}

runHealthTest().catch((error) => {
  console.error('❌ Health endpoint test failed:', error);
  process.exit(1);
});
