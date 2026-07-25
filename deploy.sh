#!/bin/bash
# deploy.sh — Build React client and deploy static assets to Zoho Catalyst AppSail

echo "📦 1. Building React frontend client..."
cd client
npm run build
if [ $? -ne 0 ]; then
  echo "❌ Frontend build failed. Aborting deployment."
  exit 1
fi

echo "🔄 2. Syncing build files to AppSail static server..."
cp -r dist/assets/* "../server/static/assets/"
cp dist/index.html "../server/static/index.html"

cd ..
echo "🚀 3. Deploying to Zoho Catalyst server..."
catalyst deploy --only client,slate
