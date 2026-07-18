/** True when a user session token is present in this browser. */
export function isLoggedIn(): boolean {
  try {
    return !!localStorage.getItem('accessToken');
  } catch {
    return false;
  }
}
