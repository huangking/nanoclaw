#!/bin/bash
# Start NanoClaw without proxy
cd /home/ecs-user/nanoclaw
unset HTTP_PROXY HTTPS_PROXY http_proxy https_proxy
exec node dist/index.js
