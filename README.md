## Books App
# Endpoints
The app contains 3 simple endpoints:
To persist books in the database.

```
POST /books
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
The database used in this app is Postgres. I have added a redis cache, so when Postgres is down, the app should still serves GET and POST requests. The data will be cached in redis and when Postgres is up again, the data will migrate from redis to postgres.


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
1. Spinup book service, redis and postgres

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

