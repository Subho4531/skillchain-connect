'use client';

import { useWalletContext } from '@/contexts/WalletContext';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { WalletConnect } from '@/components/WalletConnect';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Shield, Award, CheckCircle, ArrowRight } from 'lucide-react';
import { getRole } from '@/lib/api';

export default function HomePage() {
  const { activeAddress, isConnected } = useWalletContext();
  const router = useRouter();

  const { data: roleData } = useQuery({
    queryKey: ['role', activeAddress],
    queryFn: () => getRole(activeAddress!),
    enabled: !!activeAddress && isConnected,
  });

  const handleNavigate = () => {
    if (roleData?.role === 'PLATFORM_ADMIN') {
      router.push('/admin/platform');
    } else if (roleData?.role === 'COLLEGE_ADMIN') {
      router.push('/admin/college');
    } else {
      router.push('/student');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <nav className="border-b bg-white/90 backdrop-blur-md shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-2 rounded-xl">
              <Shield className="h-7 w-7 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              CredChain
            </span>
          </div>
          <WalletConnect />
        </div>
      </nav>

      <main className="container mx-auto px-4 py-20">
        <div className="text-center mb-20">
          <div className="inline-block mb-4 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
            🚀 Powered by Algorand Blockchain
          </div>
          <h1 className="text-6xl font-extrabold mb-6 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Decentralized Academic
            <br />
            Credential Issuer
          </h1>
          <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
            Issue real NFT credentials on Algorand blockchain. Secure, verifiable, and permanent.
          </p>
          {!isConnected ? (
            <div className="flex justify-center">
              <WalletConnect />
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <p className="text-lg text-gray-700">
                Connected as: <span className="font-semibold">{roleData?.role || 'Loading...'}</span>
              </p>
              <Button 
                onClick={handleNavigate}
                disabled={!roleData?.role}
                className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                Go to Dashboard
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-20">
          <Card className="p-8 hover:shadow-2xl transition-all border-2 hover:border-blue-200">
            <div className="bg-blue-100 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
              <Shield className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold mb-3">Real Blockchain</h3>
            <p className="text-gray-600 leading-relaxed">
              Every credential is a real ASA NFT on Algorand. No mock data, no simulations.
            </p>
          </Card>

          <Card className="p-8 hover:shadow-2xl transition-all border-2 hover:border-green-200">
            <div className="bg-green-100 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold mb-3">Verified On-Chain</h3>
            <p className="text-gray-600 leading-relaxed">
              Admin permissions verified through smart contract. Complete transparency.
            </p>
          </Card>

          <Card className="p-8 hover:shadow-2xl transition-all border-2 hover:border-purple-200">
            <div className="bg-purple-100 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
              <Award className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="text-2xl font-bold mb-3">IPFS Storage</h3>
            <p className="text-gray-600 leading-relaxed">
              Documents and metadata stored permanently on IPFS with SHA256 verification.
            </p>
          </Card>
        </div>

        <Card className="max-w-4xl mx-auto p-10 shadow-xl border-2">
          <h2 className="text-3xl font-bold mb-8 text-center">How It Works</h2>
          <div className="space-y-6">
            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl flex items-center justify-center font-bold text-lg shadow-lg">
                1
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-2">Student Uploads Document</h3>
                <p className="text-gray-600 leading-relaxed">
                  Student submits credential request with PDF document. Document is hashed (SHA256) and uploaded to IPFS.
                </p>
              </div>
            </div>
            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl flex items-center justify-center font-bold text-lg shadow-lg">
                2
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-2">College Admin Reviews</h3>
                <p className="text-gray-600 leading-relaxed">
                  College admin (verified on-chain) reviews and approves or rejects the request.
                </p>
              </div>
            </div>
            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl flex items-center justify-center font-bold text-lg shadow-lg">
                3
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-2">Real NFT Minted</h3>
                <p className="text-gray-600 leading-relaxed">
                  Real ASA NFT created on Algorand with metadata hash. Transaction confirmed on-chain before database write.
                </p>
              </div>
            </div>
            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 text-white rounded-xl flex items-center justify-center font-bold text-lg shadow-lg">
                4
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-2">NFT Transferred to Student</h3>
                <p className="text-gray-600 leading-relaxed">
                  NFT transferred to student wallet. Permanent proof of credential ownership.
                </p>
              </div>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
}
