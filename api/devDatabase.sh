#!/bin/bash
docker rm -f grants-dev-mysql
docker run --name grants-dev-mysql -e MYSQL_ROOT_PASSWORD=test -p 3306:3306 -d mysql
