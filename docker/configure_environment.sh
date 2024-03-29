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
# 6 contact email
configure_env () {
    case "$3" in
        [Yy]* )
            sed -i 's#_NPM_SKIP_START_#NPM_SKIP_START=1#g' "$1"
            sed -i 's#_GOOGLE_DOMAINS_TOKEN_#None#g' "$1"  

            ;;
        * )
            sed -i 's#_NPM_SKIP_START_##g' "$1"
            update_placeholder "(general) Google Domains access token:" "_GOOGLE_DOMAINS_TOKEN_" "$1"  n

            ;;
    esac

    sed -i "s#_ACME_EMAIL_#$6#g" "$1"
    sed -i "s#_TRAEFIK_ENABLED_#true#g" "$1"

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
# 5 contact email
configure_icecast () {
    case "$4" in
        [Yy]* )
            sed -i 's#_SOURCE_PASSWORD_#hackme#g' "$1"
            sed -i 's#_RELAY_PASSWORD_#hackme#g' "$1"
            sed -i 's#_ADMIN_USERNAME_#admin#g' "$1"
            sed -i 's#_ADMIN_PASSWORD_#hackme#g' "$1"

            ;;
        * )
            update_placeholder "(Icecast): Source password:" "_SOURCE_PASSWORD_" "$1"
            update_placeholder "(Icecast): Relay password:" "_RELAY_PASSWORD_" "$1"
            update_placeholder "(Icecast): Admin username:" "_ADMIN_USERNAME_" "$1"
            update_placeholder "(Icecast): Admin password:" "_ADMIN_PASSWORD_" "$1"

            ;;
    esac

    update_placeholder "(Icecast): Log level (4 Debug, 3 Info, 2 Warn, 1 Error):" "_LOG_LEVEL_" "$1"

    sed -i "s#_LOCATION_#nowhere#g" "$1"
    sed -i "s#_CONTACT_#$5#g" "$1"
    sed -i "s#_HOSTNAME_#$2#g" "$1"
    sed -i "s#_AUTH_URL_#$3/radio#g" "$1"
}

########################################
# 1 website dir
# 2 domain node
# 3 domain chat
# 4 domain stream
# 5 is in dev env
configure_node () {
    copy_template "$1/backend/config.js.in" "$1/backend/config.js"

    sed -i "s#_DOMAIN_NODE_#$2#g" "$1/backend/config.js"
    sed -i "s#_DOMAIN_CHAT_#$3#g" "$1/backend/config.js"
    sed -i "s#_DOMAIN_STREAM_#$4#g" "$1/backend/config.js"

    case "$5" in
        [Yy]* )
            sed -i 's#_SECRET_KEY_#12345678901234567890123456789012#g' "$1/backend/config.js"
            sed -i 's#_VALIDATION_ANSWER_#1234567890#g' "$1/backend/config.js"
            sed -i 's#_VALIDATION_QUESTION_#1234567890#g' "$1/backend/config.js"

            sed -i 's#_WEB_PROTOCOL_#http://#g' "$1/backend/config.js"

            ;;
        * )
            update_placeholder "(Node): Secret key for encryption (32 chars):" "_SECRET_KEY_" "$1/backend/config.js"
            update_placeholder "(Node): Validation question:" "_VALIDATION_QUESTION_" "$1/backend/config.js"
            update_placeholder "(Node): Validation answer:" "_VALIDATION_ANSWER_" "$1/backend/config.js"

            sed -i 's#_WEB_PROTOCOL_#https://#g' "$1/backend/config.js"

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
            traefik_enabled="#"
            tls_challenge="false"
            entrypoints="web"

            ;;
        * )
            traefik_enabled=""
            tls_challenge="true"
            entrypoints="websecure"

            ;;
    esac

    sed -i "s/_TRAEFIK_ENABLED_/${traefik_enabled}/g" "$compose_traefik_cfg"
    sed -i "s/_TRAEFIK_ENABLED_/${traefik_enabled}/g" "$compose_node_cfg"
    sed -i "s/_TRAEFIK_ENABLED_/${traefik_enabled}/g" "$compose_icecast_cfg"
    sed -i "s/_TRAEFIK_ENABLED_/${traefik_enabled}/g" "$compose_rocketchat_cfg"

    sed -i "s#_ENTRYPOINTS_#${entrypoints}#g" "$compose_node_cfg"
    sed -i "s#_ENTRYPOINTS_#${entrypoints}#g" "$compose_icecast_cfg"
    sed -i "s#_ENTRYPOINTS_#${entrypoints}#g" "$compose_rocketchat_cfg"

    case "$2" in
        [Yy]* )
            sed -i "s#_NETWORK_ALIASES_#  aliases:\n          - 'radio.localhost'\n          - 'chat.localhost'\n          - 'stream.localhost'\n#g" "$compose_traefik_cfg"

            sed -i "s#7000:7000#7777:7000#g" "$compose_node_cfg"
            sed -i "s#8000:8000#8888:8000#g" "$compose_icecast_cfg"
            sed -i "s#3000:3000#3333:3000#g" "$compose_rocketchat_cfg"

            ;;

        * )
            sed -i "s#_NETWORK_ALIASES_##g" "$compose_traefik_cfg"

            sed -i "s#- "9229:9229"##- "9229:9229"#g" "$compose_node_cfg"

            ;;
    esac
}

################################################################################
# Main
################################################################################

echo "(general) Used in VSCode development environment (y/n):"
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
        contact_email="user@radio.de"
        ;;
    * )
        echo "(general) Domain:"
        read domain
        echo "(general) Contact email adress:"
        read contact_email 
        ;;
esac

domain_node="radio.$domain"
domain_streaming="stream.$domain"
domain_chat="chat.$domain"

configure_env "$env_file" "$docker_dir" "$is_dev_env" "$icecast_cfg" "$domain" "$contact_email"
configure_icecast "$icecast_cfg" "$domain_streaming" "$domain_node" "$is_dev_env" "$contact_email"
configure_node "$website_dir" "$domain_node" "$domain_chat" "$domain_streaming" "$is_dev_env"
configure_traefik "$docker_dir" "$is_dev_env"