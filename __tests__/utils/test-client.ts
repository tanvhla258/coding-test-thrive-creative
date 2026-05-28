export const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';

export async function apiGet<T = unknown>(path: string): Promise<{ status: number; data: T }> {
  const res = await fetch(`${BASE_URL}${path}`);
  const data = await res.json();
  return { status: res.status, data };
}

export async function apiPost<T = unknown>(
  path: string,
  body: unknown
): Promise<{ status: number; data: T }> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return { status: res.status, data };
}
