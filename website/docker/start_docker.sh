#!/bin/bash
scripts=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )

pushd $scripts/..
docker-compose -f $scripts/docker-compose.rocketchat.yml up
popd