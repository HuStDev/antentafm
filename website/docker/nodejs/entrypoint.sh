#!/bin/bash
pushd /usr/app
npm install

if [[ -z "${NPM_SKIP_START}" ]]; then
    npm start
else
    echo "Skip NPM start"
    # keep container running
    tail -f /dev/null
fi

popd