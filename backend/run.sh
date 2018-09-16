#!/bin/bash
rm -rf redisdata/ ; ./redis.sh  ; nodemon tokensubminer.js
