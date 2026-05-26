/**
 * Map Supabase error messages to user-friendly German messages
 */
export function mapAuthError(error) {
  const message = error?.message || error || 'Authentifizierungsfehler'

  const errorMap = {
    'Invalid login credentials': 'Email oder Passwort ist falsch',
    'User already registered': 'Ein Konto mit dieser Email existiert bereits',
    'User already exists': 'Ein Konto mit dieser Email existiert bereits',
    'Email not confirmed': 'Email-Bestätigung erforderlich',
    'Email link is invalid or has expired': 'Email-Link ist ungültig oder abgelaufen',
    'Invalid email': 'Ungültige Email-Adresse',
    'Password should be at least 6 characters': 'Passwort muss mindestens 6 Zeichen lang sein'
  }

  // Check if error matches a known pattern
  for (const [key, value] of Object.entries(errorMap)) {
    if (message.includes(key)) {
      return value
    }
  }

  // Default fallback
  return 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.'
}
