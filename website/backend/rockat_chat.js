import axios from 'axios';
import jsonwebtoken from 'jsonwebtoken';
import Enum from 'enum';

import { rocket_chat_url } from './config.js';
import { secret_key } from './config.js';
import { Errors } from './errors.js';
import * as Global from './globals.js';

function generate_header(payload) {
    const header_informations = {
        headers:{
            'X-Auth-Token': payload[Global.key_auth_token],
            'X-User-Id': payload[Global.key_user_id], 
            'Content-type': 'application/json'
        }
    };

    return header_informations;
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
            expiresIn: Math.floor(Date.now() / 1000) + (60 * 3)
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
            }
        );

        if (response.status != 200) {
            console.log(response.status, reponse.statusText);
            throw Errors.LOGIN_INVALID_CREDENTIALS
        }

        let result = {};
        result[Global.key_auth_token] = sign_token(response.data['data']);

        return result;
    } catch(error) {
        console.log(error.message);
        throw Errors.LOGIN_INVALID_CREDENTIALS;
    }
}

export async function verify(token) {
    let payload = null;

    try {
        payload = decode_token(token);
    } catch(error) {
        console.log(error.message);
        throw Errors.LOGIN_UNEXPECTED_ERROR;
    }

    if (payload == null) {
        throw Errors.LOGIN_SESSION_EXPIRED;
    }

    try {
        let response = await axios.post(
            rocket_chat_url + '/api/v1/me',
            {
                //resume: payload[Global.key_auth_token]
            },
            generate_header(payload)
        );

        return response;
    } catch(error) {
        console.log(error.message);
        throw Errors.LOGIN_UNEXPECTED_ERROR;
    }
}
