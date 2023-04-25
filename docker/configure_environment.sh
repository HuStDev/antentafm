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
configure_env () {
    case $3 in
        [Yy]* ) sed -i "s#_NPM_SKIP_START_#NPM_SKIP_START=1#g" "$1";;
        * ) sed -i "s#_NPM_SKIP_START_##g" "$1";;
    esac

    host_dir="$(dirname "$2")/website"
    sed -i "s#_NODE_HOST_DIR_#$host_dir#g" "$1"

    sed -i "s#_ICECAST_CONFIG_#$4#g" "$1"

    update_placeholder "Rocket.Chat version (proposed 5.4.8):" "_ROCKET_CHAT_" "$1"
    update_placeholder "MongoDB version (proposed 4.4.9):" "_MONGO_DB_" "$1"
    update_placeholder "Traefik version (v2.9.10):" "_ROCKET_CHAT_" "$1"
    update_placeholder "Email that shall be used for ACME:" "_ACME_EMAIL_" "$1"
}

########################################
# 1 path to icecast cfg
configure_icecast () {
    update_placeholder "Location of server:" "_LOCATION_" "$1"
    update_placeholder "Admin email (and name):" "_CONTACT_" "$1"
    update_placeholder "URL of icecast host (if run in dev env with docker use ip of docker ethernet adapter):" "_HOSTNAME_" "$1"
    update_placeholder "Source password:" "_SOURCE_PASSWORD_" "$1"
    update_placeholder "Relay password:" "_RELAY_PASSWORD_" "$1"
    update_placeholder "Admin username:" "_ADMIN_USERNAME_" "$1"
    update_placeholder "Admin password:" "_ADMIN_PASSWORD_" "$1"
    update_placeholder "Authentication url:" "_AUTH_URL_" "$1"
    update_placeholder "Log level (4 Debug, 3 Info, 2 Warn, 1 Error):" "_LOG_LEVEL_" "$1"
}

################################################################################
# Main
################################################################################

echo "Used in VSCode development environment (y/n)?"
read is_dev_env

base_dir="$(realpath "$BASH_SOURCE")"
base_dir="$(dirname "$base_dir")"

env_file="$base_dir/.env"

echo "# Path where to save icecast.xml configuration?"
read icecast_cfg
icecast_cfg="$icecast_cfg/icecast.xml"

copy_template "$base_dir/env.template" "$env_file"
copy_template "$base_dir/icecast.xml.in" "$icecast_cfg"

configure_env "$env_file" "$base_dir" "$is_dev_env" "$icecast_cfg"
configure_icecast "$icecast_cfg"
