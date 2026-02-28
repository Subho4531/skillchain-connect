#!/bin/bash

echo "🚀 CredChain Setup Script"
echo "========================="
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi
echo "✅ Node.js found: $(node --version)"

# Check Python
if ! command -v python3 &> /dev/null; then
    echo "❌ Python is not installed. Please install Python 3.8+ first."
    exit 1
fi
echo "✅ Python found: $(python3 --version)"

# Install Node dependencies
echo ""
echo "📦 Installing Node.js dependencies..."
npm install

echo ""
echo "📦 Installing backend dependencies..."
cd backend
npm install
cd ..

# Install Python dependencies
echo ""
echo "📦 Installing Python dependencies for smart contracts..."
cd contracts
pip install -r requirements.txt
cd ..

echo ""
echo "✅ Setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Get TestNet ALGO: https://bank.testnet.algorand.network/"
echo "2. Configure contracts/.env with your wallet details"
echo "3. Deploy contract: npm run deploy:contract"
echo "4. Update .env and backend/.env with App ID"
echo "5. Start backend: npm run backend"
echo "6. Start frontend: npm run dev"
echo ""
echo "📚 See QUICK_DEPLOY.md for detailed instructions"
