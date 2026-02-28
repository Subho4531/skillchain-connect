const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

async function apiRequest(endpoint: string, options: RequestInit = {}, wallet?: string) {
  const headers: HeadersInit = {
    ...options.headers,
  };

  if (wallet) {
    headers['x-wallet-address'] = wallet;
  }

  if (options.body && typeof options.body === 'string') {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Request failed');
  }

  return response.json();
}

export async function getRole(wallet: string) {
  return apiRequest('/api/auth/role', {}, wallet);
}

export async function uploadCredential(formData: FormData, wallet: string) {
  const response = await fetch(`${API_URL}/api/credentials/upload`, {
    method: 'POST',
    headers: {
      'x-wallet-address': wallet,
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Upload failed');
  }

  return response.json();
}

export async function getMyRequests(wallet: string) {
  return apiRequest('/api/credentials/my-requests', {}, wallet);
}

export async function getPendingRequests(wallet: string) {
  return apiRequest('/api/credentials/pending', {}, wallet);
}

export async function approveCredential(id: string, wallet: string) {
  return apiRequest(`/api/credentials/approve/${id}`, {
    method: 'POST',
  }, wallet);
}

export async function rejectCredential(id: string, reason: string, wallet: string) {
  return apiRequest(`/api/credentials/reject/${id}`, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  }, wallet);
}

export async function getContractAdmins(wallet: string) {
  return apiRequest('/api/admin/contract-admins', {}, wallet);
}
