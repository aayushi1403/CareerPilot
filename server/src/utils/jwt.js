import jwt from 'jsonwebtoken';

const getSecret = () => process.env.JWT_SECRET || 'careerpilot_dev_jwt_secret_key_2026_secure';
const getExpiresIn = () => process.env.JWT_EXPIRES_IN || '7d';

/**
 * Generate a signed JWT token
 */
export const generateToken = (payload) => {
  return jwt.sign(payload, getSecret(), {
    expiresIn: getExpiresIn(),
  });
};

/**
 * Verify a JWT token
 */
export const verifyToken = (token) => {
  return jwt.verify(token, getSecret());
};

