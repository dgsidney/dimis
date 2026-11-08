const { spawn } = require('child_process');
const path = require('path');

const cleanEnv = { ...process.env };
delete cleanEnv.ELECTRON_RUN_AS_NODE;

const electron = require('electron');

const child = spawn(electron, ['.'], {
  cwd: __dirname,
  env: cleanEnv,
  detached: true,
  stdio: 'ignore'
});

child.unref();
process.exit(0);
