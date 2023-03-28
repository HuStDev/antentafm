import * as RocketChat from './rockat_chat.js'
import * as Global from './globals.js';

export class Session {
    static login(request, response) {
        RocketChat.login(
            request.body[Global.key_user_name],
            request.body[Global.key_user_password]
        ).then(function (data) {
            data[Global.key_status] = 200;
            response.status(data[Global.key_status]).send(data);
        }).catch(function(error) {
            let data = {};
            data[Global.key_auth_token] = null;
            data[Global.key_message] = error.key;
            data[Global.key_status] = 401;

            response.status(data[Global.key_status]).send(data);
        })
    }

    static sso(request, response) {     
        RocketChat.verify(
            request.query[Global.key_auth_token]
        ).then(function (data) {
            data[Global.key_status] = 200;
            response.status(data[Global.key_status]).send(data);
        }).catch(function(error) {
            let data = {};
            data[Global.key_auth_token] = null;
            data[Global.key_message] = error.key;
            data[Global.key_status] = 401;

            response.status(data[Global.key_status]).send(data);
        })
    }
}
