#!/usr/bin/env python3
import os
from algosdk import account, mnemonic
from algosdk.v2client import algod
from algosdk.atomic_transaction_composer import AccountTransactionSigner
from beaker import client
from admin_registry import app
from dotenv import load_dotenv

load_dotenv()

ALGOD_SERVER = os.getenv("ALGORAND_ALGOD_SERVER", "https://testnet-api.algonode.cloud")
ALGOD_TOKEN = os.getenv("ALGORAND_ALGOD_TOKEN", "")

PLATFORM_ADMIN_WALLET = os.getenv("PLATFORM_ADMIN_WALLET")
COLLEGE_ADMIN_WALLET = os.getenv("COLLEGE_ADMIN_WALLET")
DEPLOYER_MNEMONIC = os.getenv("DEPLOYER_MNEMONIC", "")

APP_ID = 756317263

def initialize_contract():
    print("🔧 Initializing AdminRegistry Contract...")
    
    algod_client = algod.AlgodClient(ALGOD_TOKEN, ALGOD_SERVER)
    
    private_key = mnemonic.to_private_key(DEPLOYER_MNEMONIC)
    signer = AccountTransactionSigner(private_key)
    
    app_client = client.ApplicationClient(
        client=algod_client,
        app=app,
        app_id=APP_ID,
        signer=signer
    )
    
    print(f"📍 Platform Admin: {PLATFORM_ADMIN_WALLET}")
    print(f"📍 College Admin: {COLLEGE_ADMIN_WALLET}")
    
    try:
        result = app_client.call(
            "initialize",
            platform_admin_addr=PLATFORM_ADMIN_WALLET,
            college_admin_addr=COLLEGE_ADMIN_WALLET
        )
        
        print("✅ Contract initialized successfully!")
        print(f"🔗 Transaction: {result.tx_id}")
        
        with open("DEPLOYMENT_INFO.txt", "w") as f:
            f.write(f"APP_ID={APP_ID}\n")
            f.write(f"PLATFORM_ADMIN={PLATFORM_ADMIN_WALLET}\n")
            f.write(f"COLLEGE_ADMIN={COLLEGE_ADMIN_WALLET}\n")
        
        print(f"\n⚠️  IMPORTANT: Update backend/.env with:")
        print(f"ALGORAND_APP_ID={APP_ID}")
        
    except Exception as e:
        print(f"❌ Initialization failed: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    initialize_contract()
