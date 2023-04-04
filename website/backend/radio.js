import * as Global from './globals.js';
import * as RocketChat from './rockat_chat.js'

export class Radio {
    static handle(request, response) {
        if ('action' in request.body) {
            if (request.body['action'] == 'listener_add') {
                Radio.login_user(request, response);
            } else if (request.body['action'] == 'listener_remove') {
                Radio.logout_user(request, response);
            } else if (request.body['action'] == 'mount_add') {
                Radio.stream_start(response);
            } else if (request.body['action'] == 'mount_remove') {
                Radio.stream_stop(response);
            } else {
                return response.sendStatus(401);
            }
        } else {
            return response.sendStatus(401);
        }
    }

    static login_user(request, response) {
        if (Global.key_auth_token in request.query) {
            Radio.login_user_by_token(
                request.query[Global.key_auth_token],
                response
            );
        } else {
            Radio.login_user_by_credentials(
                request.query[Global.key_radio_user],
                request.query[Global.key_radio_password],
                response
            );
        } 
    }

    static login_user_by_credentials(username, password, response) {
        RocketChat.login(
            username,
            password
        ).then(function (data) {
            response.setHeader('icecast-auth-user', '1');
            response.sendStatus(200);
        }).catch(function(error) {
            response.sendStatus(401);
        });
    }

    static login_user_by_token(token, response) {
        RocketChat.verify(
            token
        ).then(function (data) {
            response.setHeader('icecast-auth-user', '1');
            response.sendStatus(200);
        }).catch(function(error) {
            response.sendStatus(401);
        })
    }

    static logout_user(request, response) {
        return response.sendStatus(200);
    }

    static stream_start(response) {
        return response.sendStatus(200);
    }

    static stream_stop(response) {
        return response.sendStatus(200);
    }
}