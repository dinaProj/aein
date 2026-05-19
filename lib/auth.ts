// Hard-coded admin credentials
const ADMIN_CREDENTIALS = {
  username: 'admin',
  password: 'Aein@1234',
}

const ADMIN_SESSION_VALUE = 'aein-admin-local-session'

export function validateAdminCredentials(
  username: string,
  password: string
): boolean {
  return (
    username === ADMIN_CREDENTIALS.username &&
    password === ADMIN_CREDENTIALS.password
  )
}

export const ADMIN_SESSION_COOKIE = 'admin_session'

export function generateSessionToken(): string {
  return ADMIN_SESSION_VALUE
}

export function isAdminSessionValid(token?: string): boolean {
  return token === ADMIN_SESSION_VALUE
}
