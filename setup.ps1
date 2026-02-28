# CredChain Setup Script for Windows PowerShell

Write-Host "🚀 CredChain Setup Script" -ForegroundColor Cyan
Write-Host "=========================" -ForegroundColor Cyan
Write-Host ""

# Check Node.js
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js found: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js is not installed. Please install Node.js 18+ first." -ForegroundColor Red
    exit 1
}

# Check Python
try {
    $pythonVersion = python --version
    Write-Host "✅ Python found: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Python is not installed. Please install Python 3.8+ first." -ForegroundColor Red
    exit 1
}

# Install Node dependencies
Write-Host ""
Write-Host "📦 Installing Node.js dependencies..." -ForegroundColor Yellow
npm install

Write-Host ""
Write-Host "📦 Installing backend dependencies..." -ForegroundColor Yellow
Set-Location backend
npm install
Set-Location ..

# Install Python dependencies
Write-Host ""
Write-Host "📦 Installing Python dependencies for smart contracts..." -ForegroundColor Yellow
Set-Location contracts
pip install -r requirements.txt
Set-Location ..

Write-Host ""
Write-Host "✅ Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor Cyan
Write-Host "1. Get TestNet ALGO: https://bank.testnet.algorand.network/"
Write-Host "2. Configure contracts/.env with your wallet details"
Write-Host "3. Deploy contract: npm run deploy:contract"
Write-Host "4. Update .env and backend/.env with App ID"
Write-Host "5. Start backend: npm run backend"
Write-Host "6. Start frontend: npm run dev"
Write-Host ""
Write-Host "📚 See QUICK_DEPLOY.md for detailed instructions" -ForegroundColor Cyan
