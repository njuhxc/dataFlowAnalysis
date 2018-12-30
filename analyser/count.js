var fs = require("fs");
var readline = require('readline');

var files = process.argv.slice(2);
file1 = files[0].split("/");
//console.log(file1.length);
f = file1[file1.length-1];
version = file1[file1.length-2];
//console.log(version);
f2 = f.split(".");
f3 = f2[0];
//console.log(f3);


/*
* 按行读取文件内容
* 返回：字符串数组
* 参数：fReadName:文件名路径
*      callback:回调函数
* */
fs.readFile(""+files, 'utf8', function(err, data){
    f1=data.split("\n");
    f2=data.split(",");
    f=f1.length+","+f2.length+"\n";
    //console.log(f);
    fs.appendFile("output/"+version+"_result.csv", f,  function(err) {
    if (err) {
       return console.error(err);
   }
})
});
