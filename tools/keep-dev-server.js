const { spawn } = require('child_process');
const path = require('path');

const cmd = 'npm';
const args = ['start'];
const cwd = path.resolve(__dirname, '..');
let child;
let restarting = false;

function start() {
  console.log('[supervisor] Starting dev server (npm start)...');
  // Use shell:true on Windows to avoid spawn EINVAL when running npm from Node
  child = spawn(cmd, args, { cwd, stdio: 'inherit', shell: true });

  child.on('exit', (code, signal) => {
    if (restarting) return;
    console.log(`[supervisor] Dev server exited with code=${code} signal=${signal}`);
    if (code === 0) {
      console.log('[supervisor] Dev server exited cleanly. Not restarting.');
      process.exit(0);
    }
    const wait = 2000;
    console.log(`[supervisor] Restarting in ${wait}ms...`);
    setTimeout(() => start(), wait);
  });

  child.on('error', (err) => {
    console.error('[supervisor] Spawn error:', err);
    const wait = 2000;
    setTimeout(() => start(), wait);
  });
}

process.on('SIGINT', () => {
  console.log('[supervisor] SIGINT received, shutting down child');
  restarting = true;
  if (child) child.kill('SIGINT');
  process.exit(0);
});
process.on('SIGTERM', () => {
  console.log('[supervisor] SIGTERM received, shutting down child');
  restarting = true;
  if (child) child.kill('SIGTERM');
  process.exit(0);
});

start();
