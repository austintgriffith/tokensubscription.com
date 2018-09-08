#!/bin/bash
docker rm -f token-subscriber-redis
docker run --name token-subscriber-redis -v ${PWD}/redisdata:/data -p 57300:6379 -d redis redis-server --appendonly yes
