import Enum from 'enum';

export const Errors = new Enum([
    'LOGIN_UNEXPECTED_ERROR',
    'LOGIN_INVALID_CREDENTIALS',
    'LOGIN_INVALID_SESSION_TOKEN',
    'LOGIN_SESSION_EXPIRED'
]);