// Temporary helper to add an `address` field under each device-id node in Firebase.
// Run once with:
//   node scripts/addDeviceAddressField.js
//
// It PATCHes: /{deviceId}.json with { address: null } if the field doesn't exist yet.

const DATABASE_URL = process.env.FIREBASE_DATABASE_URL || process.env.REACT_APP_FIREBASE_DATABASE_URL || 'https://kerios-4cf38-default-rtdb.firebaseio.com/';
const DATABASE_SECRET = process.env.FIREBASE_DATABASE_SECRET || process.env.REACT_APP_FIREBASE_DATABASE_SECRET || '0MYjfEbMGcsuG96AmGxKMoN1T7mCKsoSpWBhO6RL';

if (!DATABASE_URL || !DATABASE_SECRET) {
  console.error('Set FIREBASE_DATABASE_URL / REACT_APP_FIREBASE_DATABASE_URL and FIREBASE_DATABASE_SECRET / REACT_APP_FIREBASE_DATABASE_SECRET first.');
  process.exit(1);
}

const baseUrl = DATABASE_URL.endsWith('/') ? DATABASE_URL : `${DATABASE_URL}/`;

function buildUrl(path) {
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `${baseUrl}${cleanPath}.json?auth=${DATABASE_SECRET}`;
}

async function fetchJson(url, options) {
  const res = await fetch(url, options);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status} ${res.statusText}: ${text}`);
  }
  return await res.json();
}

async function main() {
  if (typeof fetch === 'undefined') {
    console.error('Global fetch is not available in this Node version. Please run with Node 18+.');
    process.exit(1);
  }

  console.log('[helper] Loading Firebase root...');
  const rootData = await fetchJson(buildUrl(''));

  if (!rootData || typeof rootData !== 'object') {
    console.log('[helper] Root is empty or not an object. Nothing to do.');
    return;
  }

  const deviceIds = Object.keys(rootData);
  console.log(`[helper] Found ${deviceIds.length} top-level nodes.`);

  for (const deviceId of deviceIds) {
    const node = rootData[deviceId];
    // Skip if this top-level node is clearly not a device object (e.g. already just timestamps)
    if (!node || typeof node !== 'object') continue;

    if (Object.prototype.hasOwnProperty.call(node, 'address')) {
      console.log(`[helper] ${deviceId}: address already present, skipping.`);
      continue;
    }

    console.log(`[helper] ${deviceId}: adding address: null`);
    try {
      await fetchJson(buildUrl(deviceId), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: null }),
      });
      console.log(`[helper] ${deviceId}: OK`);
    } catch (err) {
      console.error(`[helper] ${deviceId}: FAILED ->`, err.message);
    }
  }

  console.log('[helper] Done.');
}

main().catch((err) => {
  console.error('[helper] Unexpected error:', err);
  process.exit(1);
});

