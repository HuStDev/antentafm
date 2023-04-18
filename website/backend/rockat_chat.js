import axios from 'axios';
import jsonwebtoken from 'jsonwebtoken';

import { rocket_chat_url } from './config.js';
import { secret_key } from './config.js';
import { Errors } from './errors.js';
import { Utils } from './utils.js';
import * as Global from './globals.js';
import * as Config from './config.js';

const timeout = 2500; // 2.5s

function generate_header() {
    const header = {
        headers:{
            'Content-type': 'application/json'
        },
        timeout: timeout
    };

    return header;
}

function update_header(header, key, value) {
    header["headers"][key] = value;
    return header;
}

function generate_auth_header(payload) {
    let header = generate_header();

    header = update_header(header, "X-Auth-Token", payload[Global.key_auth_token]);
    header = update_header(header, "X-User-Id", payload[Global.key_user_id]);
    //header = update_header(header, "Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, X-User-Id, X-Auth-Token");

    return header;
}

function sign_token(data) {
    const hour = 60 * 60;
    const day = hour * 24;

    let payload = {};
    payload[Global.key_user_id] = data['userId'];
    payload[Global.key_auth_token] = data['authToken'];

    const token = jsonwebtoken.sign(
        payload,
        secret_key,
        {
            algorithm: 'HS256',
            expiresIn: Math.floor(Date.now() / 1000) + (60 * 15)
        }
    );

    return token;
}

function decode_token(web_token) {
    const auth_token = jsonwebtoken.verify(
        web_token,
        secret_key,
        {
            algorithm: 'HS256'
        }
    );

    const date_expired = Math.floor(Date.now() / 1000);
    if (auth_token['iat'] > date_expired) {
        return null;
    }

    delete auth_token['iat'];
    delete auth_token['exp'];

    return auth_token;
}

export async function login(username, password) {
    try {
        let response = await axios.post(
            rocket_chat_url + '/api/v1/login',
            {
                user: username,
                password: password
            },
            //generate_header()
        );

        if (response.status != 200) {
            console.log(response.status, reponse.statusText);
            throw Errors.LOGIN_INVALID_CREDENTIALS
        }

        let result = {};
        result[Global.key_auth_token] = sign_token(response.data['data']);

        return result;
    } catch(error) {
        Utils.log_error(error);
        throw Errors.LOGIN_INVALID_CREDENTIALS;
    }
}

export async function register(user, password, validation) {
    if (!(String(validation).toLowerCase() == String(Config.validation).toLocaleLowerCase())) {
        throw Errors.REGISTER_INVALID_VALIDATION;
    }

    try {
        let response = await axios.post(
            rocket_chat_url + '/api/v1/users.register',
            {
                username: user,
                pass: password,
                name: user,
                email: user + '@antenta.fm'
            },
            generate_header()
        );

        if (response.status != 200) {
            console.log(response.status, reponse.statusText);
            throw Errors.REGISTER_FAILED
        }

        return;
    } catch(error) {
        Utils.log_error(error);
        throw Errors.REGISTER_FAILED;
    }
}

export async function change_password(session_token, current_password, new_password) {
    let payload = null;

    try {
        payload = decode_token(session_token);
    } catch(error) {
        Utils.log_error(error);
        throw Errors.LOGIN_INVALID_SESSION_TOKEN;
    }

    if (payload == null) {
        throw Errors.LOGIN_SESSION_EXPIRED;
    }

    try {
        const data = {
            data: {
                currentPassword : Utils.encode_sha_256(current_password),
                newPassword: new_password,
            }
        };

        let response = await axios.post(
            rocket_chat_url + '/api/v1/users.updateOwnBasicInfo',
            data,
            generate_auth_header(payload)
        );

        if (response.status != 200) {
            console.log(response.status, reponse.statusText);
            throw Errors.UPDATE_FAILED;
        }

        return;
    } catch(error) {
        Utils.log_error(error);
        throw Errors.UPDATE_FAILED;
    }
}

export async function verify(token) {
    let payload = null;

    try {
        payload = decode_token(token);
    } catch(error) {
        Utils.log_error(error);
        throw Errors.LOGIN_INVALID_SESSION_TOKEN;
    }

    if (payload == null) {
        throw Errors.LOGIN_SESSION_EXPIRED;
    }

    try {
        const response = await axios.post(
            rocket_chat_url + '/api/v1/login',
            {
                resume: payload[Global.key_auth_token]
            },
            generate_auth_header(payload)
        );

        let result = {};
        result[Global.key_auth_token] = token

        return result;
    } catch(error) {
        Utils.log_error(error);
        throw Errors.LOGIN_UNEXPECTED_ERROR;
    }
}
