#!/bin/bash
function getdir(){
    for element in `ls $1`
    do  
        dir_or_file=$1"/"$element
        echo $dir_or_file
        rm $dir_or_file/r.js
        rm $dir_or_file/jquery-1.9.1.js
        rm $dir_or_file/jquery-1.9.1.ajax_xhr.min.js
        rm $dir_or_file/jquery.min.js
        rm $dir_or_file/jquery-basis.js
        for file in `ls $dir_or_file`
        do
            echo $dir_or_file/$file
            nodejs complete.js $dir_or_file/$file
        done
    done
}
root_dir="/home/gui/jquery"
getdir $root_dir
