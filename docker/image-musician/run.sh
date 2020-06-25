#!/bin/bash

docker container stop $(docker container ls -aq)

docker container rm $(docker container ls -aq)

docker build --tag res/musician .

docker run -d res/musician piano
docker run -d res/musician flute
docker run -d res/musician flute
docker run -d res/musician drum