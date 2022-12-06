#! /bin/bash

docker build -t srp33/colorblind_friendly_tester .

docker run -i -t --rm --user $(id -u):$(id -g) -p 8080:3000 srp33/colorblind_friendly_tester
