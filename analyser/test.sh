#!/bin/bash
function getdir(){
    for element in `ls $1`
    do  
        dir_or_file=$1"/"$element
        echo $dir_or_file
        for file in `ls $dir_or_file`
        do
            echo $dir_or_file/$file
            nodejs count.js $dir_or_file/$file
        done
    done
}
root_dir="/home/gui/pythia/input"
getdir $root_dir
