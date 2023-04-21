import * as Global from './globals.js';
import * as Config from './config.js';
import * as RocketChat from './rockat_chat.js'

import { HtmlBuilder } from './html_builder.js';

import { Utils } from './utils.js'
import { exec } from 'child_process';

export class Radio {

    constructor() {
        this.record_process = null;
        this.recordings_dir = Config.recordings_fs_dir;
    }

    handle(request, response) {
        if ('action' in request.body) {
            if (request.body['action'] == 'listener_add') {
                this.#login_user(request, response);
            } else if (request.body['action'] == 'listener_remove') {
                this.#logout_user(request, response);
            } else if (request.body['action'] == 'mount_add') {
                this.#stream_start(response);
            } else if (request.body['action'] == 'mount_remove') {
                this.#stream_stop(response);
            } else {
                return response.sendStatus(401);
            }
        } else {
            return response.sendStatus(401);
        }
    }

    #login_user(request, response) {
        request = this.#split_query_from_mount(request);

        if (Global.key_auth_token in request.query) {
            const token = request.query[Global.key_auth_token];

            if (token == Config.secret_key) {
                this.#send_login_response(response);
            } else {
                this.#login_user_by_token(
                    token,
                    response
                );
            }
        } else {
            this.#login_user_by_credentials(
                request.query[Global.key_radio_user],
                request.query[Global.key_radio_password],
                response
            );
        } 
    }

    #login_user_by_credentials(username, password, response) {
        RocketChat.login(
            username,
            password
        ).then(function (data) {
            this.#send_login_response(response);
        }).catch(function(error) {
            response.sendStatus(401);
        });
    }

    #login_user_by_token(token, response) {
        RocketChat.verify(
            token
        ).then(function (data) {
            this.#send_login_response(response);
        }).catch(function(error) {
            response.sendStatus(401);
        })
    }

    #send_login_response(response) {
        response.setHeader('icecast-auth-user', '1');
        response.sendStatus(200);  
    }

    #split_query_from_mount(request) {
        if ("mount" in request.query) {
            const query = Utils.query_from_string(request.query["mount"]);
            for (const [key, value] of Object.entries(query)) {
                request.query[key] = value;
            }

            request.query["mount"] = request.query["mount"].split("?")[0];
        }

        return request;
    }

    #logout_user(request, response) {
        return response.sendStatus(200);
    }

    #stream_start(response) {
        try {
            if (!(this.record_process == null)) {
                this.record_process.unref();
                this.record_process = null;
            }

            response.sendStatus(200);

            const output_file = this.recordings_dir + "/antentafm_" + Utils.get_date_and_time_as_string() + ".ogg ";
            const command = "curl --output " + output_file + Config.icecast_stream_url + "?" + Global.key_auth_token + "=" + Config.secret_key;
            
            this.record_process = exec(command);

            console.log("start recording stream");
        } catch(error) {
            console.log(error);

            this.record_process.unref();
            this.record_process = null;

            response.sendStatus(200);
        }

        return;
    }

    #stream_stop(response) {
        try {
            if (!(this.record_process == null)) {
                this.record_process.unref();
                console.log("stop recording stream");
            }
        } catch(error) {
            console.log(error);
        }

        this.record_process = null;

        const builder = new HtmlBuilder();
        builder.generate(this.recordings_dir);

        return response.sendStatus(200);
    }
}