# ANTENTAFM

## Productive

## Development

This git repository is configured for VSCode. Additional following extensions are mandatory to be installed:
* Docker (Microsoft)
* Dev Containers (Microsoft)

As described above, a docker environment is used to set up the whole environment.

Before you can start developing, an initial cofiguration is required.

### Icecast configuration

First you have to run configuration of icecast.

```bash
<workspace>\docker\create_icecast_config.sh
```

### Env configuration

Run the following script to configure the `.env` file. This file will be save in `<workspace>\docker`.

ifconfig -> docker