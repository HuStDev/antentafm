#!/bin/bash
base_dir="$(realpath "$BASH_SOURCE")"
base_dir="$(dirname "$base_dir")"

pushd $base_dir
docker-compose -f docker-compose.node.yml -f docker-compose.rocketchat.yml -f docker-compose.icecast.yml -f docker-compose.traefik.yml up
popd