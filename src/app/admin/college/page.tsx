'use client';

import { useWalletContext } from '@/contexts/WalletContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { WalletConnect } from '@/components/WalletConnect';
import { getPendingRequests, approveCredential, rejectCredential } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Shield, CheckCircle, XCircle, ExternalLink } from 'lucide-react';
import { useState } from 'react';
import { Input } from '@/components/ui/input';

export default function CollegeAdminPage() {
  const { activeAccount } = useWalletContext();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const { data: requests, isLoading } = useQuery({
    queryKey: ['pending-requests', activeAccount?.address],
    queryFn: () => getPendingRequests(activeAccount!.address),
    enabled: !!activeAccount,
  });

  const approveMutation = useMutation({
    mutationFn: ({ id }: { id: string }) => approveCredential(id, activeAccount!.address),
    onSuccess: (data) => {
      toast({
        title: 'Success',
        description: `NFT minted! Asset ID: ${data.assetId}`,
      });
      queryClient.invalidateQueries({ queryKey: ['pending-requests'] });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      rejectCredential(id, reason, activeAccount!.address),
    onSuccess: () => {
      toast({ title: 'Success', description: 'Request rejected' });
      setRejectingId(null);
      setRejectReason('');
      queryClient.invalidateQueries({ queryKey: ['pending-requests'] });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  if (!activeAccount) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Connect Wallet</CardTitle>
          </CardHeader>
          <CardContent>
            <WalletConnect />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="border-b bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-blue-600" />
            <span className="text-xl font-bold">CredChain - College Admin</span>
          </div>
          <WalletConnect />
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Pending Credential Requests</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-gray-500">Loading...</p>
            ) : requests?.data?.length === 0 ? (
              <p className="text-gray-500">No pending requests</p>
            ) : (
              <div className="space-y-4">
                {requests?.data?.map((req: any) => (
                  <Card key={req.id} className="border-2">
                    <CardContent className="pt-6">
                      <div className="grid md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-500">Credential ID</p>
                          <p className="font-semibold">{req.credential_id}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Degree</p>
                          <p className="font-semibold">{req.degree_name}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Graduation Year</p>
                          <p className="font-semibold">{req.graduation_year}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Student Wallet</p>
                          <p className="font-mono text-xs">
                            {req.student_wallet.slice(0, 8)}...{req.student_wallet.slice(-6)}
                          </p>
                        </div>
                      </div>

                      <div className="mb-4">
                        <p className="text-sm text-gray-500 mb-1">Document</p>
                        <a
                          href={`https://gateway.pinata.cloud/ipfs/${req.document_ipfs_cid}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline text-sm flex items-center gap-1"
                        >
                          View on IPFS <ExternalLink className="h-3 w-3" />
                        </a>
                        <p className="text-xs text-gray-400 font-mono mt-1">
                          Hash: {req.document_hash.slice(0, 16)}...
                        </p>
                      </div>

                      {rejectingId === req.id ? (
                        <div className="space-y-2">
                          <Input
                            placeholder="Rejection reason"
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                          />
                          <div className="flex gap-2">
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => rejectMutation.mutate({ id: req.id, reason: rejectReason })}
                              disabled={!rejectReason || rejectMutation.isPending}
                            >
                              Confirm Reject
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setRejectingId(null);
                                setRejectReason('');
                              }}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <Button
                            onClick={() => approveMutation.mutate({ id: req.id })}
                            disabled={approveMutation.isPending}
                            className="flex items-center gap-2"
                          >
                            <CheckCircle className="h-4 w-4" />
                            {approveMutation.isPending ? 'Minting NFT...' : 'Approve & Mint NFT'}
                          </Button>
                          <Button
                            variant="destructive"
                            onClick={() => setRejectingId(req.id)}
                            className="flex items-center gap-2"
                          >
                            <XCircle className="h-4 w-4" />
                            Reject
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
