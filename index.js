var path = require('path');
var fs = require('fs');
var marked = require('marked');
// var md = require('markdown-it')();
var template = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title></title>
    <link type="text/css" rel="stylesheet" href="./common.css" />
  </head>
  <body>
    @content
  </body>
</html>`;
function getFileName(fileDir) {
  if (isFoler(fileDir) === 1) {
    printFile(fileDir);
  } else {
    fs.readdir(fileDir, function (err, files) {
      if (err) return console.warn(err);
      files.forEach(filename => {
        let strPath = path.join(fileDir, filename);
        let flag = isFoler(strPath);
        if (flag === 1) {
          printFile(strPath, filename);
        }
        if (flag === 2) {
          getFileName(strPath);
        }
        // fs.stat(strPath, (err, stats) => {
        //   if (err) return console.error('stat:' + err);
        //   if (stats.isFile()) { // 是文件
        //     strPath = path.join(fileDir, filename);
        //     printFile(strPath, filename);
        //   }
        //   if (stats.isDirectory()) { // 是目录
        //     strPath = path.join(fileDir, filename);
        //     getFileName(strPath);
        //   }
        // }) 
      })
    })
  }
}

function isFoler(filepath) { // 判断是路径是目录，还是文件
  try {
    let stats = fs.statSync(filepath);
    if (stats.isFile()) {
      return 1;
    }
    if (stats.isDirectory()) {
      return 2;
    }
  } catch(e) {
    console.warn(filepath + '不存在');
  }
}

function printFile(filePath) {
  let sep = path.sep; // 获取路径片段分隔符
  let folders = filePath.split(sep);
  let filename = folders[folders.length - 1]; // 文件名
  let folder = '';
  let htmlfile = `${filename.slice(0, filename.length - 3)}.html`;
  if (folders.length > 4) { // 有子目录
    folder = folders.slice(3, folders.length - 1).join(sep);
    htmlfile = `${folder}/${htmlfile}`;
    let isExist = fsExistsSync(path.join(__dirname, `/html/${folder}`));
    if (!isExist) {
      fs.mkdirSync(path.join(__dirname, `./html/${folder}`));
    }
  }

  fs.readFile(filePath, 'utf8', function (err, data) {
    if (err) return console.warn('readFile:' + err);
    let htmlData = template.replace('@content', marked(data))
    fs.writeFile(path.join(__dirname, `./html/${htmlfile}`), htmlData, (err) => {
      if (err) console.warn('writeFile:' + err);
      else console.log(htmlfile + ' done');
    })
  })
}
function fsExistsSync(path) { // 判断目录是否存在
  try {
    fs.accessSync(path, fs.F_OK);
  } catch (e) {
    return false;
  }
  return true;
}

fs.watch('./api', { recursive: true }, (eventType, filename) => {
  getFileName(path.join(__dirname, `/api/${filename}`));
})

getFileName(path.join(__dirname, '/api'));