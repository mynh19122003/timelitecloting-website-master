#!/bin/bash

# TimeLite Clothing Website - VPS Startup Script
# This script installs dependencies and starts the application

echo "🚀 Starting TimeLite Clothing Website deployment..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    echo "Run: curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - && sudo apt-get install -y nodejs"
    exit 1
fi

echo "✓ Node.js version: $(node --version)"

# Install dependencies
echo "📦 Installing dependencies..."
npm install --production

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✓ Dependencies installed successfully"

# Check if PM2 is installed
if ! command -v pm2 &> /dev/null; then
    echo "📦 Installing PM2 globally..."
    sudo npm install -g pm2
fi

# Stop existing instance if running
pm2 stop timelitecloting 2>/dev/null || true
pm2 delete timelitecloting 2>/dev/null || true

# Start the application
echo "🚀 Starting application with PM2..."
pm2 start server.js --name timelitecloting

# Save PM2 process list
pm2 save

# Setup PM2 to start on boot
echo "⚙️  Setting up PM2 to start on boot..."
pm2 startup

echo ""
echo "✅ Deployment completed successfully!"
echo ""
echo "Application is running on http://localhost:3000"
echo ""
echo "Useful commands:"
echo "  pm2 status              - Check application status"
echo "  pm2 logs timelitecloting - View application logs"
echo "  pm2 restart timelitecloting - Restart application"
echo "  pm2 stop timelitecloting    - Stop application"
echo ""




