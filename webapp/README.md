# btcpricetomorrow Webapp Application

Port 3000

Image available at: https://hub.docker.com/repository/docker/pelazas1/btcpricetmrw-webapp/general

To run the E2E tests: 
1) Have the application running on local, (webapp at localhost:3000, api at localhost:8000, mongo db at 27017 and ml service at localhost:8000) you can do this by running:
```
docker-compose --profile development up --build -d
```
on the root project

2) cd to /webapp and run:
```
npx playwright test
```