/** Maps URL path to Layout nav highlight key (`campaign/*` → dashboard). */
export function navKeyFromPath(pathname: string): string {
  if (pathname === '/' || pathname === '') return 'home';
  const parts = pathname.split('/').filter(Boolean);
  const first = parts[0] ?? '';
  if (first === 'campaign') return 'dashboard';
  return first;
}
