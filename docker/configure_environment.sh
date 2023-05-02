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
# 5 domain 
configure_env () {
    case "$3" in
        [Yy]* )
            sed -i 's#_NPM_SKIP_START_#NPM_SKIP_START=1#g' "$1"
            sed -i 's#_ACME_EMAIL_#user@radio.de#g' "$1"

            ;;
        * )
            sed -i 's#_NPM_SKIP_START_##g' "$1"
            update_placeholder "(Docker): Email that shall be used for ACME:" "_ACME_EMAIL_" "$1"

            ;;
    esac

    sed -i 's#_TRAEFIK_ENABLED_#"true"#g' "$1"

    host_dir="$(dirname "$2")/website"
    sed -i "s#_NODE_HOST_DIR_#$host_dir#g" "$1"
    sed -i "s#_ICECAST_CONFIG_#$4#g" "$1"
    sed -i "s#_DOMAIN_#$5#g" "$1"
}

########################################
# 1 path to icecast cfg
# 2 domain streaming server
# 3 domain node application
# 4 is in dev env
configure_icecast () {
    case "$4" in
        [Yy]* )
            sed -i 's#_LOCATION_#internet=1#g' "$1"
            sed -i 's#_CONTACT_#user@radio.de#g' "$1"
            sed -i 's#_SOURCE_PASSWORD_#hackme#g' "$1"
            sed -i 's#_RELAY_PASSWORD_#hackme#g' "$1"
            sed -i 's#_ADMIN_USERNAME_#admin#g' "$1"
            sed -i 's#_ADMIN_PASSWORD_#hackme#g' "$1"

            ;;
        * )
            update_placeholder "(Icecast): Location of server:" "_LOCATION_" "$1"
            update_placeholder "(Icecast): Admin email (and name):" "_CONTACT_" "$1"
            update_placeholder "(Icecast): Source password:" "_SOURCE_PASSWORD_" "$1"
            update_placeholder "(Icecast): Relay password:" "_RELAY_PASSWORD_" "$1"
            update_placeholder "(Icecast): Admin username:" "_ADMIN_USERNAME_" "$1"
            update_placeholder "(Icecast): Admin password:" "_ADMIN_PASSWORD_" "$1"

            ;;
    esac

    update_placeholder "(Icecast): Log level (4 Debug, 3 Info, 2 Warn, 1 Error):" "_LOG_LEVEL_" "$1"

    sed -i "s#_HOSTNAME_#$2#g" "$1"
    sed -i "s#_AUTH_URL_#$3/radio#g" "$1"
}

########################################
# 1 website dir
# 2 domain chat
# 3 domain stream
# 4 is in dev env
configure_node () {
    copy_template "$1/backend/config.js.in" "$1/backend/config.js"

    sed -i "s#_DOMAIN_CHAT_#$2#g" "$1/backend/config.js"
    sed -i "s#_DOMAIN_STREAM_#$3#g" "$1/backend/config.js"

    case "$4" in
        [Yy]* )
            sed -i 's#_SECRET_KEY_#12345678901234567890123456789012#g' "$1/backend/config.js"
            sed -i 's#_VALIDATION_KEY_#1234567890#g' "$1/backend/config.js"

            ;;
        * )
            update_placeholder "(Node): Secret key for encryption (32 chars):" "_SECRET_KEY_" "$1/backend/config.js"
            update_placeholder "(Node): Quick validation key:" "_VALIDATION_KEY_" "$1/backend/config.js"

            ;;
    esac

    copy_template "$1/backend/config.js" "$1/frontend/config.js"

    sed -i "s#_EXPORT_#export #g" "$1/backend/config.js"
    sed -i "s#_EXPORT_##g" "$1/frontend/config.js"
}

########################################
# 1 docker config dir
# 2 is in dev env
configure_traefik () {

    compose_traefik_cfg="$1/docker-compose.traefik.yml"
    copy_template "$1/template/docker-compose.traefik.yml.in" "$compose_traefik_cfg"

    compose_node_cfg="$1/docker-compose.node.yml"
    copy_template "$1/template/docker-compose.node.yml.in" "$compose_node_cfg"

    compose_icecast_cfg="$1/docker-compose.icecast.yml"
    copy_template "$1/template/docker-compose.icecast.yml.in" "$compose_icecast_cfg"

    compose_rocketchat_cfg="$1/docker-compose.rocketchat.yml"
    copy_template "$1/template/docker-compose.rocketchat.yml.in" "$compose_rocketchat_cfg"

    case "$2" in
        [Yy]* )
            sed -i "s#_ENTRYPOINT_#websecure#g" "$compose_traefik_cfg"
            sed -i "s#_REDIRECT_#web#g" "$compose_traefik_cfg"
            sed -i "s#_SCHEME_#http#g" "$compose_traefik_cfg"

            sed -i "s#_TLS_CHALLENGE_#false#g" "$compose_traefik_cfg"
            sed -i "s#_TLS_CHALLENGE_#false#g" "$compose_node_cfg"
            sed -i "s#_TLS_CHALLENGE_#false#g" "$compose_icecast_cfg"
            sed -i "s#_TLS_CHALLENGE_#false#g" "$compose_rocketchat_cfg"

            ;;
        * )
            sed -i "s#_ENTRYPOINT_#web#g" "$compose_traefik_cfg"
            sed -i "s#_REDIRECT_#websecure#g" "$compose_traefik_cfg"
            sed -i "s#_SCHEME_#https#g" "$compose_traefik_cfg"

            sed -i "s#_TLS_CHALLENGE_#true#g" "$compose_traefik_cfg"
            sed -i "s#_TLS_CHALLENGE_#true#g" "$compose_node_cfg"
            sed -i "s#_TLS_CHALLENGE_#true#g" "$compose_icecast_cfg"
            sed -i "s#_TLS_CHALLENGE_#true#g" "$compose_rocketchat_cfg"

            ;;
    esac

    case "$2" in
        [Yy]* )
            sed -i "s#_NETWORK_ALIASES_#networks:\n      antentafm:\n        aliases:\n          - 'radio.localhost'\n          - 'chat.localhost'\n          - 'stream.localhost'\n#g" "$compose_traefik_cfg"

            ;;

        * )
            sed -i "s#_NETWORK_ALIASES_##g" "$compose_traefik_cfg"

            ;;
    esac
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

copy_template "$docker_dir/template/env.template" "$env_file"
copy_template "$docker_dir/template/icecast.xml.in" "$icecast_cfg"

website_dir="$(dirname "$docker_dir")"
website_dir="$website_dir/website"

case "$is_dev_env" in
    [Yy]* )
        domain="localhost"
        ;;
    * )
        echo "Domain:"
        read domain
        ;;
esac

domain_node="radio.$domain"
domain_streaming="stream.$domain"
domain_chat="chat.$domain"

configure_env "$env_file" "$docker_dir" "$is_dev_env" "$icecast_cfg" "$domain"
configure_icecast "$icecast_cfg" "$domain_streaming" "$domain_node" "$is_dev_env"
configure_node "$website_dir" "$domain_node" "$domain_streaming" "$is_dev_env"
configure_traefik "$docker_dir" "$is_dev_env"