#!/bin/bash

echo "Starting deployment..."

# 1. Pull the latest code from GitHub
git pull origin main

# 2. Install dependencies
npm install

# 3. Build the Next.js production files
npm run build

# 4. Check if PM2 process exists, then start or restart
if pm2 describe cmdlify > /dev/null; then
  echo "PM2 process found. Restarting cmdlify..."
  pm2 restart cmdlify
else
  echo "PM2 process not found. Starting cmdlify for the first time..."
  pm2 start npm --name "cmdlify" -- start
fi

# 5. Save the PM2 list so it restarts automatically if the server reboots
pm2 save

echo "Deployment complete! App is live."