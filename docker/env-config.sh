#------ Docker compose variables ------
export PG_IMAGE="postgres:12"
export PG_HOST="localhost"
export PG_PORT="5432"
export PG_USER="demo"
export PG_PASSWORD="demo"
export PG_DB="demo"

export REDIS_IMAGE="redis:latest"
export REDIS_UNAME="admin"
export REDIS_PORT="6379"
export REDIS_HOST="host.docker.internal"
export REDIS_PASS=""
export MODE="development"


