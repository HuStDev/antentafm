#!/bin/bash
script_dir=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )

pushd $script_dir
docker run -it -v /home/hust/antentafm/website/backend:/usr/app hust/node:0.1.0 /bin/bash
popd