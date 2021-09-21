#! /usr/bin/env bash
source ./docker/env-config.sh
docker-compose -f ./docker/docker-compose.yaml up --build -d