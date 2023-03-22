const key_user_name = "afm_user_name"
const key_user_id = "afm_user_id"
const key_user_password = "afm_user_password"
const key_auth_token = "afm_auth_token"
const key_message = "afm_message"
const key_status = "afm_status"
const key_origin = "afm_origin"

function redirect () {
    alert("redirect");
    if (localStorage.getItem(key_origin) === null) {
        window.location.href = '/';
    } else {
        window.location.href = localStorage.getItem(key_origin);
    }
}

function verify() {
    alert("verify");
    
    localStorage.setItem(key_origin, window.location.href)

    if (localStorage.getItem(key_auth_token) === null) {
        alert("no token");
        window.location.href = '/login'
    } else {
        let data = {};
        data[key_auth_token] = localStorage.getItem(key_auth_token);

        $.ajax(
            {
                url : window.location.origin + '/verify',
                type : "POST",
                data : data,
                success: function(response) {
                    // In case of valid response, store auth token in session data and load root with query of auth token
                    localStorage.setItem(key_auth_token, response[key_auth_token]);
    
                    alert('verify valid');

                    redirect();
                },
                error : function(response_header) {
                    // In case of error, remove auth token from session storage, post error and reload form
                    localStorage.removeItem(key_auth_token);
                    alert(response_header.responseJSON[key_message]);

                    alert('verify invalid');
    
                    window.location.href = '/login';
                }
            }
        );
    }
}

function login (username, password) {
    alert("login");
    let data = {};
    data[key_user_name] = username;
    data[key_user_password] = password;

    $.ajax(
        {
            url : window.location.origin + '/login',
            type : "POST",
            data : data,
            success: function(response) {
                // In case of valid response, store auth token in session data and load root with query of auth token
                localStorage.setItem(key_auth_token, response[key_auth_token]);

                alert("login valid");

                redirect();
            },
            error : function(response_header) {
                // In case of error, remove auth token from session storage, post error and reload form
                localStorage.removeItem(key_auth_token);
                alert(response_header.responseJSON[key_message]);

                alert("login invalid");

                window.location.href = '/login';
            }
        }
    );
}