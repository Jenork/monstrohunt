import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/profile?address=0x...
 * Returns Farcaster/Base App profile (display_name, username) for the given address.
 * Uses Neynar API when NEYNAR_API_KEY is set; otherwise returns 200 with null.
 */
export async function GET(request: NextRequest) {
  const address = request.nextUrl.searchParams.get('address');
  if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
    return NextResponse.json({ error: 'Invalid address' }, { status: 400 });
  }

  const apiKey = process.env.NEYNAR_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ displayName: null, username: null });
  }

  try {
    const url = new URL('https://api.neynar.com/v2/farcaster/user/bulk-by-address/');
    url.searchParams.set('addresses', address.toLowerCase());

    const res = await fetch(url.toString(), {
      headers: { 'x-api-key': apiKey },
      next: { revalidate: 300 }, // cache 5 min
    });

    if (!res.ok) {
      return NextResponse.json({ displayName: null, username: null });
    }

    const data = await res.json();
    // Neynar bulk-by-address: response may be { [address]: User[] } or { users: User[] }
    let users = data[address.toLowerCase()] ?? data[address] ?? data.users;
    if (!Array.isArray(users) && data && typeof data === 'object')
      users = Object.values(data).find((v): v is unknown[] => Array.isArray(v) && v.length > 0);
    const user = Array.isArray(users) ? users[0] : null;
    const displayName = user?.display_name ?? null;
    const username = user?.username ?? null;

    return NextResponse.json({ displayName, username });
  } catch {
    return NextResponse.json({ displayName: null, username: null });
  }
}
