import * as RocketChat from './rockat_chat.js'
import * as Global from './globals.js';
import { rocket_chat_url } from './config.js';

export class Session {
    static login(request, response) {
        RocketChat.login(
            request.body[Global.key_user_name],
            request.body[Global.key_user_password]
        ).then(function (data) {
            data = Session.update_response_data(data, 200, "LOGIN_SUCCESSFUL");
            response.status(data[Global.key_status]).send(data);
        }).catch(function(error) {
            let data = Session.prepare_response_data(401, error.key);
            data[Global.key_auth_token] = null;
            response.status(data[Global.key_status]).send(data);
        })
    }

    static logout(request, response) {
        RocketChat.logout(
            request.body[Global.key_auth_token]
        ).then(function () {
            const data = Session.prepare_response_data(200, "LOGOUT_SUCCESSFUL");
            response.status(data[Global.key_status]).send(data);
        }).catch(function(error) {
            const data = Session.prepare_response_data(401, error.key);
            response.status(data[Global.key_status]).send(data);
        })
    }

    static register(request, response) {
        RocketChat.register(
            request.body[Global.key_user_name],
            request.body[Global.key_user_password],
            request.body[Global.key_user_validation]
        ).then(function () {
            const data = Session.prepare_response_data(200, "REGISTRATION_SUCCESSFUL");
            response.status(data[Global.key_status]).send(data);
        }).catch(function(error) {
            const data = Session.prepare_response_data(401, error.key);
            response.status(data[Global.key_status]).send(data);
        })
    }

    static change_password(request, response) {        
        RocketChat.login(
            request.body[Global.key_user_name],
            request.body[Global.key_user_password]
        ).then(function (data) {
            RocketChat.change_password(
                data[Global.key_auth_token],
                request.body[Global.key_user_password],
                request.body[Global.key_user_password_new]
            ).then(function () {
                const data = Session.prepare_response_data(200, "PASSWORD_CHANGE_SUCCESSFUL");
                response.status(data[Global.key_status]).send(data);
            }).catch(function(error) {
                const data = Session.prepare_response_data(401, error.key);
                response.status(data[Global.key_status]).send(data);
            })
        }).catch(function(error) {
            let data = Session.prepare_response_data(401, error.key);
            data[Global.key_auth_token] = null;
            response.status(data[Global.key_status]).send(data);
        })
    }

    static sso(request, response) {     
        RocketChat.verify(
            request.query[Global.key_auth_token]
        ).then(function (data) {
            data = Session.update_response_data(data, 200, "SSO_LOGIN_SUCCESSFUL");

            response.status(data[Global.key_status]).send(data);
        }).catch(function(error) {
            let data = Session.prepare_response_data(401, error.key);
            data[Global.key_auth_token] = null;

            response.status(data[Global.key_status]).send(data);
        })
    }

    static chat_token(request, response) {
        RocketChat.decode_to_chat_token(
            request.query[Global.key_auth_token]
        ).then(function (data) {
            response.status(200).send(data);
        }).catch(function(error) {
            let data = Session.prepare_response_data(401, error.key);
            data[Global.key_auth_token] = null;

            response.status(data[Global.key_status]).send(data);
        })
    }

    static use(request, response, next) {
        response.set('Access-Control-Allow-Origin', rocket_chat_url);
        response.set('Access-Control-Allow-Credentials', 'true');
      
        for (const [key, value] of Object.entries(request.body)) {
            request.query[key] = value;
        }

        next();
    }

    static prepare_response_data(status, message="") {
        let data = {}

        data[Global.key_message] = message;
        data[Global.key_status] = status;

        return data;
    }

    static update_response_data(data, status, message="") {
        data[Global.key_message] = message;
        data[Global.key_status] = status;

        return data;
    }
}
