#!/bin/bash
function getdir(){
    for element in `ls $1`
    do  
        #echo $1/$element
        nodejs count2.js $1/$element
    done
}
root_dir="/home/gui/pythia/output"
getdir $root_dir
