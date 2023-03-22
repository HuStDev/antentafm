import axios from 'axios';

import { rocket_chat_url } from './config.js';
import { Errors } from './errors.js';
import { response } from 'express';
import * as Config from './globals.js';

export async function login(username, password) {
    try {
        let response = await axios.post(
            rocket_chat_url + '/api/v1/login',
            {
                user: username,
                password: password
            },
        );

        if (response.status != 200) {
            console.log(response.status, reponse.statusText);
            throw Errors.LOGIN_INVALID_CREDENTIALS
        }

        let result = {};
        result[Config.key_user_id] = response.data['data']['userId'];
        result[Config.key_auth_token] = response.data['data']['authToken'];

        return result;
    } catch(error) {
        console.log(error.message);
        throw Errors.LOGIN_UNEXPECTED_ERROR;
    }
}

export async function validate_session(token) {
    try {
        response = await axios.post(
            rocket_chat_url + '/api/v1/login',
            {
                resume: token
            }
        );

        return response;
    } catch(error) {
        console.log(error.message);
        throw Errors.LOGIN_INVALID_SESSION_TOKEN;
    }
}
