// scripts/start-dev.js
const { spawn, exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

const log = (color, message) => {
  console.log(`${colors[color]}${message}${colors.reset}`);
};

const isWindows = process.platform === 'win32';
const processes = [];

// Cleanup function
const cleanup = () => {
  log('yellow', '\n🧹 Cleaning up processes...');
  processes.forEach(proc => {
    if (proc && !proc.killed) {
      if (isWindows) {
        exec(`taskkill /pid ${proc.pid} /t /f`, () => {});
      } else {
        process.kill(-proc.pid, 'SIGTERM');
      }
    }
  });
  process.exit(0);
};

// Handle process termination
process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
process.on('exit', cleanup);

// Check if file exists
const fileExists = (filePath) => {
  try {
    return fs.existsSync(filePath);
  } catch (err) {
    return false;
  }
};

// Create environment files
const createEnvFiles = () => {
  log('yellow', '⚙️  Setting up environment files...');
  
  // Frontend .env
  if (!fileExists('.env')) {
    const frontendEnv = `API_URL=http://10.0.2.2:3000
SOCKET_URL=http://10.0.2.2:3000
GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here`;
    fs.writeFileSync('.env', frontendEnv);
    log('green', '✅ Created .env file');
  }

  // Backend .env
  if (!fileExists('backend/.env')) {
    const backendEnv = `# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/familyconnect?schema=public"

# JWT
JWT_SECRET="familyconnect_super_secret_key_2024_change_in_production"
JWT_EXPIRE="30d"

# Server
PORT=3000
NODE_ENV="development"

# Frontend URL (for CORS)
FRONTEND_URL="http://localhost:3000"

# Optional: File uploads
UPLOAD_PATH="./uploads"
MAX_FILE_SIZE="10mb"`;
    fs.writeFileSync('backend/.env', backendEnv);
    log('green', '✅ Created backend/.env file');
  }
};

// Run command and return promise
const runCommand = (command, args, options = {}) => {
  return new Promise((resolve, reject) => {
    const proc = spawn(command, args, {
      stdio: 'inherit',
      shell: isWindows,
      detached: !isWindows,
      ...options
    });

    proc.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with code ${code}`));
      }
    });

    proc.on('error', (err) => {
      reject(err);
    });
  });
};

// Check and install dependencies
const checkDependencies = async () => {
  log('yellow', '📦 Checking dependencies...');
  
  if (!fileExists('node_modules')) {
    log('yellow', '📦 Installing React Native dependencies...');
    await runCommand('npm', ['install']);
  }

  if (!fileExists('backend/node_modules')) {
    log('yellow', '📦 Installing Backend dependencies...');
    process.chdir('backend');
    await runCommand('npm', ['install']);
    process.chdir('..');
  }
};

// Start database
const startDatabase = async () => {
  log('yellow', '🐘 Checking database...');
  
  try {
    // Try to connect to existing PostgreSQL
    const { spawn } = require('child_process');
    const testConnection = spawn('psql', ['-h', 'localhost', '-p', '5432', '-U', 'postgres', '-l'], {
      stdio: 'ignore'
    });
    
    testConnection.on('close', async (code) => {
      if (code === 0) {
        log('green', '✅ PostgreSQL is running');
        
        // Setup database
        try {
          process.chdir('backend');
          await runCommand('npm', ['run', 'db:generate'], { stdio: 'pipe' });
          await runCommand('npm', ['run', 'db:migrate'], { stdio: 'pipe' });
          process.chdir('..');
          log('green', '✅ Database setup complete');
        } catch (error) {
          log('yellow', '⚠️  Database setup failed. Please ensure PostgreSQL is running.');
        }
      } else {
        log('yellow', '⚠️  PostgreSQL not detected. Please start PostgreSQL manually.');
      }
    });
    
  } catch (error) {
    log('yellow', '⚠️  Could not detect PostgreSQL. Please ensure it\'s installed and running.');
  }
};

// Start backend server
const startBackend = () => {
  log('green', '🖥️  Starting backend server on port 3000...');
  
  const backendProcess = spawn('npm', ['run', 'dev'], {
    cwd: 'backend',
    stdio: 'pipe',
    shell: isWindows,
    detached: !isWindows
  });

  processes.push(backendProcess);

  backendProcess.stdout.on('data', (data) => {
    process.stdout.write(`[Backend] ${data}`);
  });

  backendProcess.stderr.on('data', (data) => {
    process.stderr.write(`[Backend] ${data}`);
  });

  backendProcess.on('close', (code) => {
    if (code !== 0) {
      log('red', `❌ Backend process exited with code ${code}`);
    }
  });

  return backendProcess;
};

// Start Metro bundler
const startMetro = () => {
  log('green', '📱 Starting Metro bundler...');

  const metroProcess = spawn('npm', ['start'], {
    stdio: 'pipe',
    shell: isWindows,
    detached: !isWindows
  });

  processes.push(metroProcess);

  metroProcess.stdout.on('data', (data) => {
    process.stdout.write(`[Metro] ${data}`);
  });

  metroProcess.stderr.on('data', (data) => {
    process.stderr.write(`[Metro] ${data}`);
  });

  metroProcess.on('close', (code) => {
    if (code !== 0) {
      log('red', `❌ Metro process exited with code ${code}`);
    }
  });

  return metroProcess;
};

// Main function
const main = async () => {
  try {
    log('blue', '🚀 Starting FamilyConnect Development Environment');
    
    // Check if we're in the right directory
    if (!fileExists('package.json')) {
      log('red', '❌ Please run this script from the project root directory');
      process.exit(1);
    }

    // Setup environment
    createEnvFiles();
    await checkDependencies();
    await startDatabase();

    // Start services
    startBackend();
    
    // Wait a bit for backend to start
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    startMetro();

    // Success message
    log('green', '✅ Development environment started successfully!');
    log('blue', '📱 To run on Android: npm run android (in a new terminal)');
    log('blue', '📱 To run on iOS: npm run ios (in a new terminal)');
    log('blue', '🌐 Backend API: http://localhost:3000');
    log('blue', '📊 Database Studio: npm run db:studio (in a new terminal)');
    log('yellow', 'Press Ctrl+C to stop all services');

    // Keep the script running
    process.stdin.resume();

  } catch (error) {
    log('red', `❌ Error: ${error.message}`);
    process.exit(1);
  }
};

// Run the main function
main().catch(error => {
  log('red', `❌ Fatal error: ${error.message}`);
  process.exit(1);
});
