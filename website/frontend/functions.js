const key_user_name = "afm_user_name"
const key_user_id = "afm_user_id"
const key_user_password = "afm_user_password"
const key_auth_token = "afm_auth_token"
const key_message = "afm_message"
const key_status = "afm_status"
const key_origin = "afm_origin"

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
            url : window.location.origin + '/sso',
            type : "POST",
            data : data,
            success: function(response) {
                localStorage.setItem(key_auth_token, response[key_auth_token]);
            },
            error : function(response_header) {
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

function login (username, password) {
    let data = {};
    data[key_user_name] = username;
    data[key_user_password] = password;

    $.ajax(
        {
            url : window.location.origin + '/login',
            type : "POST",
            data : data,
            success: function(response) {
                // In case of valid response, store auth token in session data
                localStorage.setItem(key_auth_token, response[key_auth_token]);

                let query = [];
                query[key_auth_token] = response[key_auth_token];
                const href = window.location.origin + get_if_in_query(query_from_string(window.location.href), key_origin, "/") + query_to_string(query);
                window.location.href = href;
            },
            error : function(response_header) {
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