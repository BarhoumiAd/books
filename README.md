## Books App
# Endpoints
The app contains 3 simple endpoints:

To persist books in the database.

```
POST /books
```
Example
```
{
  "title": "You don't know javascript",
  "author": "bob",
  "description": "Great book"
}
```
To return list of books

```
GET /books
```
To return a specific book.

```
GET /books/{id}
```

# Database
The database used in this app is Postgres. I have added a redis as caching mechanism, so when Postgres is down, the app should still serve GET and POST requests. The data will be cached in redis and when Postgres is up again, the data will migrate from redis to postgres.


# Helm
Helm charts is used to deploy the book app in a kubernetes cluster.
Follow these steps to deploy the app in k8s cluster:
1. Clone the repo
```
git clone https://github.com/BarhoumiAd/books.git
```
and change directory to books. `cd books`.

2. Change directory to book-chart

```
cd book-chart
```
3. Run helm install/upgrade

```
helm upgrade --install book-app --namespace=default  --values ./values.yaml .
```

# Local development

I have used docker-compose for local development, to run the app locally, run the following commands:
1. Spin up book service, redis and postgres

```
npm run svc_up
```
The script will build and create the book app, spinup a postgres and redis containers. The book app is accessible on `http://localhost:3000`.

2. Check the services

```
docker ps
```

3. Teardown the services

```
npm run svc_down
```

# Tests

To run the tests, run the following command:

```
npm run test
```

The books services should still available even if postgres is down. To test it try the following:

1. Stop postgres container

```
docker stop pg
```

2. Add a book via postman or curl command

Notice that the request still pass successfully. 
watch the logs of the book container
```
docker logs book -f
```
You should see logs that is mentioning that postgres is down and is writing to only redis in case of POST request and reading from redis in Case of get Request. 
Also notice that there is this log statement `Syncing up redis to postgres` that it appears every 5 seconds. The data from redis will be migrated to postgres when it is up again.