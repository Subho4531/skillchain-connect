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


def deploy_contract():
    print("🚀 Deploying AdminRegistry Contract...")
    
    algod_client = algod.AlgodClient(ALGOD_TOKEN, ALGOD_SERVER)
    
    if not DEPLOYER_MNEMONIC or DEPLOYER_MNEMONIC == "your twenty five word mnemonic phrase here":
        private_key, deployer_address = account.generate_account()
        print(f"⚠️  Generated new deployer account: {deployer_address}")
        print(f"⚠️  Mnemonic: {mnemonic.from_private_key(private_key)}")
        print("⚠️  Fund this account at: https://bank.testnet.algorand.network/")
        return
    
    private_key = mnemonic.to_private_key(DEPLOYER_MNEMONIC)
    deployer_address = account.address_from_private_key(private_key)
    
    print(f"📍 Deployer: {deployer_address}")
    
    try:
        account_info = algod_client.account_info(deployer_address)
        balance = account_info.get('amount', 0) / 1_000_000
        print(f"💰 Balance: {balance} ALGO")
        
        if balance < 0.2:
            print("❌ Insufficient balance. Need at least 0.2 ALGO")
            return
    except Exception as e:
        print(f"❌ Error checking balance: {e}")
        return
    
    signer = AccountTransactionSigner(private_key)
    
    # Build app spec and override schema
    app_spec = app.build(algod_client)
    app_spec.global_state_schema.num_byte_slices = 2
    app_spec.global_state_schema.num_uints = 0
    
    app_client = client.ApplicationClient(
        client=algod_client,
        app=app_spec,
        signer=signer
    )
    
    print("📝 Creating application...")
    try:
        app_id, app_addr, txid = app_client.create()
        
        print(f"✅ Contract deployed!")
        print(f"📋 App ID: {app_id}")
        print(f"📬 App Address: {app_addr}")
        print(f"🔗 Transaction: {txid}")
        
        print(f"🔧 Initializing with admins...")
        result = app_client.call(
            "initialize",
            platform_admin_addr=PLATFORM_ADMIN_WALLET,
            college_admin_addr=COLLEGE_ADMIN_WALLET
        )
        
        print("✅ Contract initialized!")
        print(f"🔗 Init Transaction: {result.tx_id}")
        
        with open("DEPLOYMENT_INFO.txt", "w") as f:
            f.write(f"APP_ID={app_id}\n")
            f.write(f"APP_ADDRESS={app_addr}\n")
            f.write(f"PLATFORM_ADMIN={PLATFORM_ADMIN_WALLET}\n")
            f.write(f"COLLEGE_ADMIN={COLLEGE_ADMIN_WALLET}\n")
        
        print(f"\n📄 Deployment info saved to DEPLOYMENT_INFO.txt")
        print(f"🌐 View: https://testnet.algoexplorer.io/application/{app_id}")
        print(f"\n⚠️  IMPORTANT: Update backend/.env with:")
        print(f"ALGORAND_APP_ID={app_id}")
        
        return app_id, app_addr
    except Exception as e:
        print(f"❌ Deployment failed: {e}")
        import traceback
        traceback.print_exc()
        return None


if __name__ == "__main__":
    deploy_contract()
