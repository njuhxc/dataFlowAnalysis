var fs = require("fs");
var readline = require('readline');

var files = process.argv.slice(2);
file1 = files[0].split("/");
//console.log(file1.length);
f = file1[file1.length-1];


/*
* 按行读取文件内容
* 返回：字符串数组
* 参数：fReadName:文件名路径
*      callback:回调函数
* */
fs.readFile(""+files, 'utf8', function(err, data){
    var score = 0;
    f1=data.split("\n");
    f1.forEach(function(v,i,a){
        f2 = v.split(",");
        f2.forEach(function(v2,i2,a2){
            score += Number(v2);
        });
    });
    console.log(""+f+","+score);
});

