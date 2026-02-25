// Password validation middleware
// New rules: 8-64 characters, at least one uppercase, one lowercase and one digit.
const PASS_REGEX = /^(?=.{8,64}$)(?=.*[A-Z])(?=.*[a-z])(?=.*\d).*$/

export function validatePasswordMiddleware(req, res, next) {
  const { password } = req.body

  if (typeof password !== 'string') {
    return res.status(400).json({ message: 'Mot de passe invalide.' })
  }

  if (!PASS_REGEX.test(password)) {
    return res.status(400).json({
      message:
        'Mot de passe invalide : 8–64 caractères, au moins une majuscule, une minuscule et un chiffre.'
    })
  }

  next()
}
