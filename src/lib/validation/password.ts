const COMMON_PASSWORDS = new Set([
  '12345678', '123456789', '1234567890', 'password', 'password1',
  'qwerty123', 'iloveyou', 'letmein', 'welcome', 'monkey',
  'dragon', 'master', 'sunshine', 'princess', 'abc12345',
])

/**
 * Validates a password against the app's security policy.
 * Returns an error message string, or null if the password is valid.
 */
export function validatePassword(password: string): string | null {
  if (password.length < 8) {
    return 'La contraseña debe tener al menos 8 caracteres.'
  }
  if (password.length > 72) {
    // bcrypt truncates at 72 bytes — inform the user
    return 'La contraseña no puede superar los 72 caracteres.'
  }
  if (COMMON_PASSWORDS.has(password.toLowerCase())) {
    return 'Esa contraseña es demasiado común. Elegí una más segura.'
  }
  return null
}
