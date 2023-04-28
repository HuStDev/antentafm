#!/bin/bash

################################################################################
# Utility functions
################################################################################

update_placeholder() {
    echo "$1"
    read input

    sed -i "s#$2#$input#g" "$3"
}

copy_template() {
    rm -f "$2"
    cp -f "$1" "$2"    
}

########################################
# 1 path to env file
# 2 base dir
# 3 is in dev env
# 4 path to icecast config file
# 5 domain node application
configure_env () {
    case $3 in
        [Yy]* ) sed -i "s#_NPM_SKIP_START_#NPM_SKIP_START=1#g" "$1";;
        * ) sed -i "s#_NPM_SKIP_START_##g" "$1";;
    esac

    host_dir="$(dirname "$2")/website"
    sed -i "s#_NODE_HOST_DIR_#$host_dir#g" "$1"
    sed -i "s#_ICECAST_CONFIG_#$4#g" "$1"
    sed -i "s#_DOMAIN_NODE_APP_#$5#g" "$1"

    update_placeholder "(Docker): Email that shall be used for ACME:" "_ACME_EMAIL_" "$1"
}

########################################
# 1 path to icecast cfg
# 2 domain streaming server
# 3 domain node application
configure_icecast () {
    update_placeholder "(Icecast): Location of server:" "_LOCATION_" "$1"
    update_placeholder "(Icecast): Admin email (and name):" "_CONTACT_" "$1"
    update_placeholder "(Icecast): Source password:" "_SOURCE_PASSWORD_" "$1"
    update_placeholder "(Icecast): Relay password:" "_RELAY_PASSWORD_" "$1"
    update_placeholder "(Icecast): Admin username:" "_ADMIN_USERNAME_" "$1"
    update_placeholder "(Icecast): Admin password:" "_ADMIN_PASSWORD_" "$1"
    update_placeholder "(Icecast): Log level (4 Debug, 3 Info, 2 Warn, 1 Error):" "_LOG_LEVEL_" "$1"

    sed -i "s#_HOSTNAME_#$2#g" "$1"
    sed -i "s#_AUTH_URL_#$3/radio#g" "$1"
}

########################################
# 1 website dir
# 2 domain chat
# 3 domain stream
configure_node () {
    copy_template "$1/backend/config.js.in" "$1/backend/config.js"

    sed -i "s#_DOMAIN_CHAT_#$2#g" "$1/backend/config.js"
    sed -i "s#_DOMAIN_STREAM_#$3#g" "$1/backend/config.js"

    update_placeholder "(Node): Secret key for encryption (32 chars):" "_SECRET_KEY_" "$1/backend/config.js"
    update_placeholder "(Node): Quick validation key:" "_VALIDATION_KEY_" "$1/backend/config.js"

    copy_template "$1/backend/config.js" "$1/frontend/config.js"

    sed -i "s#_EXPORT_#export #g" "$1/backend/config.js"
    sed -i "s#_EXPORT_##g" "$1/frontend/config.js"
}

################################################################################
# Main
################################################################################

echo "Used in VSCode development environment (y/n)?"
read is_dev_env

docker_dir="$(realpath "$BASH_SOURCE")"
docker_dir="$(dirname "$docker_dir")"

env_file="$docker_dir/.env"
icecast_cfg="$docker_dir/icecast.xml"

copy_template "$docker_dir/env.template" "$env_file"
copy_template "$docker_dir/icecast.xml.in" "$icecast_cfg"

website_dir="$(dirname "$docker_dir")"
website_dir="$website_dir/website"

echo "Domain of node application:"
read domain_node
echo "Domain of streaming server:"
read domain_streaming
echo "Domain of chat server:"
read domain_chat

configure_env "$env_file" "$docker_dir" "$is_dev_env" "$icecast_cfg" "$domain_node"
configure_icecast "$icecast_cfg" "$domain_streaming" "$domain_node"
configure_node "$website_dir" "$domain_node" "$domain_streaming"