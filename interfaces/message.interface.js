export const MESSAGE_ERROR_RESPONSE = {
    DEFAULT: {
        type: 'error',
        msg: 'Hubo un problema con su solicitud.'
    },
    CRENDENTIALS: { type: 'error', msg: 'Credenciales incorrectas.' },
    USER_NOT_EXIST: {
        type: 'error',
        msg: 'La cuenta no existe.'
    },
    EMAIL_EXIST: {
        type: 'error',
        msg: 'El correo se encuentra en uso.'
    },
    EMAIL_VERIFY: {
        type: 'error',
        msg: 'Verifique su cuenta, hemos enviado un mail con las intrucciones para que confirme su cuenta.'
    },
    AUTHORIZATION: {
        type: 'error',
        msg: 'No tienes permiso para acceder a esta conversación'
    },
    ARGUMENT: {
        type: 'error',
        msg: 'No esta enviando un argumento válido.'
    },
    USER_NOT_FOUND: (id) => ({
        type: 'error',
        msg: `Usuario ${id} no encontrado.`
    }),
    SEARCH_NOT_FOUND: (_search) => ({
        type: 'error',
        msg: `No se encontraron usuarios con ese término de búsqueda: ${_search}`
    })
};
export const MESSAGE_SUCCESS_RESPONSE = {
    USER_WELCOME: ({ username }) => ({
        type: 'success',
        msg: `Bienvenid@ ${username}, ¿Como te encuentras el día de hoy?`
    }),
    REGISTER_SUCCESS: {
        type: 'success',
        msg: 'Registro existoso, Esta listo para poder conectarse y enviar mensajes.'
    },
    FRIEND_REQUEST_SUCCESS: {
        type: 'success',
        msg: 'Solicitud de amistad enviada.'
    },
    FRIEND_CANCEL_REQUEST_SUCCESS: {
        type: 'success',
        msg: 'Solicitud de amistad cancelada.'
    },
    FRIEND_ACCEPT_REQUEST_SUCCESS: {
        type: 'success',
        msg: 'Solicitud de amistad aceptada.'
    },
    DELETE_FRIEND: {
        type: 'success',
        msg: 'Amigo Eliminado.'
    },
    FRIEND_ACTION_REQUEST_SUCCESS: (action) => {
        let successMessage = '';
        if (action === 'accepted') {
            successMessage = 'Solicitud de amistad aceptada.';
        } else if (action === 'rejected') {
            successMessage = 'Solicitud de amistad rechazada.';
        }
        return {
            type: 'success',
            msg: successMessage
        };
    },
    UPDATE_PROFILE_SUCCESS: {
        type: 'success',
        msg: 'Perfil actualizado.'
    }
};
