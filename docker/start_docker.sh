#!/bin/bash
base_dir="$(realpath "$BASH_SOURCE")"
base_dir="$(dirname "$base_dir")"

pushd $base_dir

if command -v docker-compose &> /dev/null
then
    docker-compose -f docker-compose.node.yml -f docker-compose.rocketchat.yml -f docker-compose.icecast.yml -f docker-compose.traefik.yml up
else
    docker compose -f docker-compose.node.yml -f docker-compose.rocketchat.yml -f docker-compose.icecast.yml -f docker-compose.traefik.yml up
fi

popd