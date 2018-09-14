#!/bin/bash
docker rm -f grants-dev-mysql
docker run --name grants-dev-mysql -e MYSQL_ROOT_PASSWORD=my-secret-pw -p 3306:3306 -d mysql
