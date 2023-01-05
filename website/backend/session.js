import * as RocketChat from './rockat_chat.js'
import * as Config from './globals.js';

export class Session {
    static login(request, response) {
        const session_data = Session.__login(request);
        response.status(session_data[Config.key_status]).send(session_data);
    }

    static __login(request) {
        if (Config.key_auth_token in request.body) {
            return Session.__login_with_token(request);
        } else {
            return Session.__login_with_credentials(request);
        }
    }

    static __login_with_token(request) {
        RocketChat.validate_session(
            request.body[Config.key_auth_token]
        ).then(function (response) {
            responst[Config.key_status] = 200;
            return response;
        }).catch(function(error) {
            let response = {};

            response[Config.key_auth_token] = null;
            response[Config.key_user_id] = null;

            response[Config.key_message] = "";
            responst[Config.key_status] = 401;

            return response;
        })
    }

    static __login_with_credentials(request) {
        RocketChat.login(
            request.body[Config.key_user_name],
            request.body[Config.key_user_name]
        ).then(function (response) {
            responst[Config.key_status] = 200;
            return response;
        }).catch(function(error) {
            let response = {};

            response[Config.key_auth_token] = null;
            response[Config.key_user_id] = null;

            response[Config.key_message] = "";
            responst[Config.key_status] = 401;

            return response;
        })
    }
}
