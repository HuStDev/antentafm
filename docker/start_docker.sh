#!/bin/sh
scripts=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )

docker-compose -f $scripts/docker-compose.rocketchat.yml up