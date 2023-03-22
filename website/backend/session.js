import * as RocketChat from './rockat_chat.js'
import * as Config from './globals.js';

export class Session {
    static login(request, response) {
        if (Config.key_auth_token in request.body) {
            return Session.__login_with_token(request, response);
        } else {
            return Session.__login_with_credentials(request, response);
        }
    }

    static __login_with_token(request, response) {
        RocketChat.validate_session(
            request.body[Config.key_auth_token]
        ).then(function (response) {
            let data = {};
            data[Config.key_status] = 200;

            response.status(data[Config.key_status]).send(data);
        }).catch(function(error) {
            let data = {};
            data[Config.key_auth_token] = null;
            data[Config.key_user_id] = null;
            data[Config.key_message] = error.key;
            data[Config.key_status] = 401;

            response.status(data[Config.key_status]).send(data);
        })
    }

    static __login_with_credentials(request, response) {
        RocketChat.login(
            request.body[Config.key_user_name],
            request.body[Config.key_user_name]
        ).then(function (data) {
            data[Config.key_status] = 200;

            response.status(data[Config.key_status]).send(data);
        }).catch(function(error) {
            let data = {};
            data[Config.key_auth_token] = null;
            data[Config.key_user_id] = null;
            data[Config.key_message] = error.key;
            data[Config.key_status] = 401;

            response.status(data[Config.key_status]).send(data);
        })
    }
}
