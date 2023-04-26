const key_user_name = "afm_user_name"
const key_user_id = "afm_user_id"
const key_user_password = "afm_user_password"
const key_user_password_new = "afm_user_password_new"
const key_user_validation = "afm_validation"
const key_auth_token = "afm_auth_token"
const key_message = "afm_message"
const key_status = "afm_status"
const key_origin = "afm_origin"
const key_stream_audio_level = "afm_stream_audio_level"
const key_stream_started = "afm_stream_started";
const key_stream_stopped = "afm_stream_stopped";
const key_is_stream_active = "afm_stream_active";
const key_is_chat = "afm_chat";

function query_from_string(text) {
    let query = {};

    if (text.indexOf('?') > -1) {
        let data = text.split('?')[1];

        if (data.indexOf('&') > -1) {
            data = data.split('\&');
            for (let idx = 0; idx < data.length; idx++) {
                const entry = data[idx].split('=');
                query[entry[0]] = entry[1];
            }

        } else {
            const entry = data.split('=');
            query[entry[0]] = entry[1];
        }
    }

    return query;
}

function query_to_string(query) {
    let text = "?";

    for (const [key, value] of Object.entries(query)) {
        text += key + "=" + value + "&";
    }

    return text;
}

function add_chat_query_info_to_link(link) {
    const query = query_from_string(window.location.href);
    const check = get_if_in_query(query, key_is_chat, false);
    if (check != false) {
        link.href = link.href + "?" + key_is_chat + "=" + check;
    }
}

function get_if_in_query(query, key, def_value) {
    if (key in query) {
        return query[key];
    } else {
        return def_value;
    }
}

function sso() {
    // Priorization where auth token should taken from
    // 1. query
    // 2. local storage
    const query = query_from_string(window.location.href);
    let token = get_if_in_query(query, key_auth_token, null);
    if (token === null) {
        if (localStorage.getItem(key_auth_token) !== null) {
            token = localStorage.getItem(key_auth_token);
        }
    }

    // Try sso
    // If sso was successful, save auth token to local storage and continue with page rendering
    // If sso failed, remove auth token from local storage and redirect to login page
    let data = {};
    data[key_auth_token] = token;
    $.ajax(
        {
            url: window.location.origin + '/sso',
            type: "POST",
            data: data,
            success: function (response) {
                localStorage.setItem(key_auth_token, response[key_auth_token]);
            },
            error: function (response_header) {
                localStorage.removeItem(key_auth_token);
                alert(response_header.responseJSON[key_message]);

                // Add origin to query, to bo able to redirect to origin after successful login
                let query_n = [];
                query_n[key_origin] = get_if_in_query(query, key_origin, window.location.pathname)

                const href = "/login" + query_to_string(query_n);
                window.location.href = href;
            }
        }
    );
}

function logout() {
    let data = {};
    data[key_auth_token] = localStorage.getItem(key_auth_token);

    $.ajax(
        {
            url: window.location.origin + '/logout',
            type: "POST",
            data: data,
            success: function (response) {
                localStorage.removeItem(key_auth_token);
                window.location.href = "/";
            },
            error: function (response_header) {
                localStorage.removeItem(key_auth_token);
                window.location.href = "/";
            }
        }
    );
}

function login(username, password) {
    let data = {};
    data[key_user_name] = username;
    data[key_user_password] = password;

    $.ajax(
        {
            url: window.location.origin + '/login',
            type: "POST",
            data: data,
            success: function (response) {
                // In case of valid response, store auth token in session data
                localStorage.setItem(key_auth_token, response[key_auth_token]);

                let query = {};
                query[key_auth_token] = response[key_auth_token];

                if (localStorage.getItem(key_is_chat) === null) {
                    localStorage.removeItem(key_is_chat);

                    const href = window.location.origin + get_if_in_query(query_from_string(window.location.href), key_origin, "/") + query_to_string(query);
                    window.location.href = href;
                } else {
                    data[key_auth_token] = response[key_auth_token];
                    $.ajax(
                        {
                            url: window.location.origin + '/chat_token',
                            type: "POST",
                            data: data,
                            success: function (response) {
                                localStorage.removeItem(key_is_chat);
                
                                window.parent.postMessage({
                                    event: 'login-with-token',
                                    loginToken: response[key_auth_token]
                                }, rocket_chat_url);
                            },
                            error: function (response) {
                                alert(response.responseJSON[key_message]);
                
                                window.location.href = "/login";
                            }
                        }
                    );
                }
            },
            error: function (response_header) {
                // In case of error, remove auth token from session storage, post error and reload form
                localStorage.removeItem(key_auth_token);
                alert(response_header.responseJSON[key_message]);

                let query = [];
                query[key_origin] = get_if_in_query(
                    query_from_string(window.location.href),
                    key_origin,
                    "/"
                );

                const href_login = "/login" + query_to_string(query);
                window.location.href = href_login;
            }
        }
    );
}

function register(username, password, validation) {
    let data = {};
    data[key_user_name] = username;
    data[key_user_password] = password;
    data[key_user_validation] = validation;

    localStorage.removeItem(key_auth_token);

    $.ajax(
        {
            url: window.location.origin + '/register',
            type: "POST",
            data: data,
            success: function (response) {
                if (key_message in response.responseJSON) {
                    alert(response.responseJSON[key_message]);
                }

                window.location.href = "/login";
            },
            error: function (response) {
                alert(response.responseJSON[key_message]);

                window.location.href = "/register";
            }
        }
    );
}

function change_password(username, password_old, password_new) {
    let data = {};
    data[key_user_name] = username;
    data[key_user_password] = password_old;
    data[key_user_password_new] = password_new;

    localStorage.removeItem(key_auth_token);

    $.ajax(
        {
            url: window.location.origin + '/password',
            type: "POST",
            data: data,
            success: function (response) {
                if (key_message in response.responseJSON) {
                    alert(response.responseJSON[key_message]);
                }

                window.location.href = "/login";
            },
            error: function (response) {
                alert(response.responseJSON[key_message]);

                window.location.href = "/password";
            }
        }
    );
}

function update_live_section() {
    const id_root_element = "id_live";
    const stream_exists = exists_stream_audio_element(id_root_element);

    $.ajax(
        {
            url: window.location.origin + '/radio_info',
            type: "POST",
            data: {},
            success: function (response) {               
                if (stream_exists == true) {
                    if (response[key_is_stream_active] == true) {
                        const time_diff = response[key_stream_started] - response[key_stream_stopped];
                        if (time_diff < (60 * 15)) {
                            const stream_last_time_stopped = Number(localStorage.getItem(key_stream_stopped));
                            if (stream_last_time_stopped != response[key_stream_stopped]) {
                                remove_stream_audio_element(id_root_element);
                                localStorage.setItem(key_stream_stopped, response[key_stream_stopped]);
                            }
                        }
                    }
                } else {
                    if (response[key_is_stream_active] == true) {
                        add_stream_audio_element(id_root_element);

                        if (localStorage.getItem(key_stream_stopped) === null) {
                            localStorage.setItem(key_stream_stopped, response[key_stream_stopped]);
                        }
                    }
                }
            },
            error: function (response) {
                if (stream_exists == true) {
                    remove_stream_audio_element(id_root_element);
                }
            }
        }
    );
}

function add_stream_audio_element(id_root_element, stream_url) {
    var sound = document.createElement("audio");
    sound.id       = 'id_stream_live';
    sound.controls = 'controls';
    sound.src      = stream_url + "?" + key_auth_token + "=" + localStorage.getItem(key_auth_token);
    sound.type     = 'audio/ogg';
    sound.preload  = 'auto';
    sound.autoplay  = 'autoplay';
    sound.className = 'rounded-lg';
    sound.style = 'background-color:#dfdef6;';

    const volume_level = localStorage.getItem(key_stream_audio_level);
    if (volume_level === null) {
        sound.volume = 0.5;
    } else {
        sound.volume = volume_level;
    }

    sound.onvolumechange = function() {
        localStorage.setItem(key_stream_audio_level, sound.volume)
    };

    document.getElementById(id_root_element).appendChild(sound);
}

function remove_stream_audio_element(id_root_element) {
    var element = document.getElementById(id_root_element);
    var children = element.children;

    for(var i = 0; i < children.length; i++){
        var child = children[i];
        if (child.id == 'id_stream_live') {
            document.getElementById(id_root_element).removeChild(child);
        }
    }
}

function exists_stream_audio_element(id_root_element) {
    var element = document.getElementById(id_root_element);
    var children = element.children;

    for(var i = 0; i < children.length; i++){
        var child = children[i];
        if (child.id == 'id_stream_live') {
            return true;
        }
    }

    return false;
}