import { API_URL } from './api';

export interface MeProfile {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  avatar_url: string | null;
  role: string;
  created_at: string | null;
}

export interface MyCertificate {
  id: string;
  username: string;
  wpm: number;
  accuracy: number;
  test_title: string;
  issued_at?: string;
  created_at?: string;
  is_valid: boolean;
}

function authHeaders(): Record<string, string> {
  const token = localStorage.getItem('accessToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/** Fetch the logged-in user's profile. Returns null if not authed / on error. */
export async function fetchMe(): Promise<MeProfile | null> {
  try {
    const res = await fetch(`${API_URL}/api/me`, { headers: authHeaders() });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

/** Update name / phone. Throws with the server message on failure. */
export async function updateMe(updates: { name?: string; phone?: string }): Promise<MeProfile> {
  const res = await fetch(`${API_URL}/api/me`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(updates),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Could not save your profile.');
  return data;
}

/** Upload a base64 data-URL avatar. Returns the new public URL. */
export async function uploadAvatar(dataUrl: string): Promise<string> {
  const res = await fetch(`${API_URL}/api/me/avatar`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ image: dataUrl }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Could not upload your photo.');
  return data.avatar_url;
}

/** Certificates linked to the logged-in account. */
export async function fetchMyCertificates(): Promise<MyCertificate[]> {
  try {
    const res = await fetch(`${API_URL}/api/me/certificates`, { headers: authHeaders() });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}
