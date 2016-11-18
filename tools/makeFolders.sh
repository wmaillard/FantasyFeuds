#!/bin/bash
ast='*'
for i in * 
do
    if test -f "$i" 
    then
       mkdir ${i%.png}
       mv ${i%.png}$ast ${i%.png}
    fi
done