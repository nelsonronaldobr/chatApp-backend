import { check } from 'express-validator';

export const loginValidations = [
    check(
        'email',
        'Por favor, ingresa una dirección de correo electrónico válida.'
    ).isEmail(),
    check(
        'password',
        'La contraseña es demasiado corta, debe tener un mínimo de 6 caracteres'
    ).isLength({ min: 6 })
];

export const registerValidations = [
    check('name', 'Por favor ingrese su nombre (mínimo de 2 caracteres).')
        .notEmpty()
        .isLength({ max: 50, min: 2 }),
    check(
        'email',
        'Por favor, ingresa una dirección de correo electrónico válida.'
    ).isEmail(),
    check(
        'password',
        'La contraseña es demasiado corta, debe tener un mínimo de 6 caracteres'
    ).isLength({ min: 6 })
];
