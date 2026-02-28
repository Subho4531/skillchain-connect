'use client';

import { useState } from 'react';
import { useWalletContext } from '@/contexts/WalletContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { WalletConnect } from '@/components/WalletConnect';
import { uploadCredential, getMyRequests } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Shield, Upload, CheckCircle, XCircle, Clock, ExternalLink } from 'lucide-react';

export default function StudentPage() {
  const { activeAddress, isConnected } = useWalletContext();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [credentialId, setCredentialId] = useState('');
  const [degreeName, setDegreeName] = useState('');
  const [graduationYear, setGraduationYear] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const { data: requests, isLoading } = useQuery({
    queryKey: ['my-requests', activeAddress],
    queryFn: () => getMyRequests(activeAddress!),
    enabled: !!activeAddress && isConnected,
  });

  const uploadMutation = useMutation({
    mutationFn: async () => {
      if (!file || !activeAddress) throw new Error('Missing data');

      const formData = new FormData();
      formData.append('credential_id', credentialId);
      formData.append('degree_name', degreeName);
      formData.append('graduation_year', graduationYear);
      formData.append('document', file);

      return uploadCredential(formData, activeAddress);
    },
    onSuccess: () => {
      toast({ title: 'Success', description: 'Credential request submitted!' });
      setCredentialId('');
      setDegreeName('');
      setGraduationYear('');
      setFile(null);
      queryClient.invalidateQueries({ queryKey: ['my-requests'] });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  if (!isConnected) {
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
            <span className="text-xl font-bold">CredChain - Student</span>
          </div>
          <WalletConnect />
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Upload Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Submit Credential Request
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  uploadMutation.mutate();
                }}
                className="space-y-4"
              >
                <div>
                  <Label htmlFor="credentialId">Credential ID</Label>
                  <Input
                    id="credentialId"
                    value={credentialId}
                    onChange={(e) => setCredentialId(e.target.value)}
                    placeholder="e.g., CRED-2024-001"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="degreeName">Degree Name</Label>
                  <Input
                    id="degreeName"
                    value={degreeName}
                    onChange={(e) => setDegreeName(e.target.value)}
                    placeholder="e.g., Bachelor of Science"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="graduationYear">Graduation Year</Label>
                  <Input
                    id="graduationYear"
                    type="number"
                    value={graduationYear}
                    onChange={(e) => setGraduationYear(e.target.value)}
                    placeholder="e.g., 2024"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="document">Document (PDF)</Label>
                  <Input
                    id="document"
                    type="file"
                    accept=".pdf"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    required
                  />
                </div>

                <Button type="submit" className="w-full" disabled={uploadMutation.isPending}>
                  {uploadMutation.isPending ? 'Uploading...' : 'Submit Request'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* My Requests */}
          <Card>
            <CardHeader>
              <CardTitle>My Requests</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <p className="text-gray-500">Loading...</p>
              ) : requests?.data?.length === 0 ? (
                <p className="text-gray-500">No requests yet</p>
              ) : (
                <div className="space-y-4">
                  {requests?.data?.map((req: any) => (
                    <Card key={req.id} className="border-2">
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <p className="font-semibold">{req.degree_name}</p>
                            <p className="text-sm text-gray-500">{req.credential_id}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            {req.status === 'PENDING' && (
                              <>
                                <Clock className="h-4 w-4 text-yellow-600" />
                                <span className="text-sm text-yellow-600">Pending</span>
                              </>
                            )}
                            {req.status === 'APPROVED' && (
                              <>
                                <CheckCircle className="h-4 w-4 text-green-600" />
                                <span className="text-sm text-green-600">Approved</span>
                              </>
                            )}
                            {req.status === 'REJECTED' && (
                              <>
                                <XCircle className="h-4 w-4 text-red-600" />
                                <span className="text-sm text-red-600">Rejected</span>
                              </>
                            )}
                          </div>
                        </div>

                        {req.credentials?.[0] && (
                          <div className="mt-4 p-4 bg-green-50 rounded-lg">
                            <p className="text-sm font-semibold text-green-900 mb-2">NFT Issued!</p>
                            <p className="text-xs text-gray-600 mb-1">
                              Asset ID: {req.credentials[0].nft_asset_id}
                            </p>
                            <a
                              href={`https://testnet.algoexplorer.io/asset/${req.credentials[0].nft_asset_id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                            >
                              View on AlgoExplorer <ExternalLink className="h-3 w-3" />
                            </a>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
