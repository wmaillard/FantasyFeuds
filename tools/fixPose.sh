#!/bin/bash
end="x0"
two=$(($2/3))
echo $two$end
echo $2$end
convert $1 -background none -gravity East -chop $two$end $1 #250x0
convert $1 -background none -gravity east -extent $2$end $1 #750x0