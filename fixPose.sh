#!/bin/bash
convert $1 -gravity East -chop 250x0 $1
convert $1 -gravity east -extent 750x0 $1