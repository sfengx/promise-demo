const fs = require('fs');
const path = require('path');

const unlinkAll = function (dir) {
  if (fs.existsSync(dir)) {
    // 文件直接删除
    if (!fs.statSync(dir).isDirectory()) {
      fs.unlinkSync(dir);
      return;
    }
    // 目录遍历删除
    const dirents = fs.readdirSync(dir, { withFileTypes: true });
    dirents.forEach(dirent => {
      // 目录递归遍历
      if (dirent.isDirectory()) {
        unlinkAll(path.resolve(dir, dirent.name));
      // 文件直接删除
      } else {
        fs.unlinkSync(path.resolve(dir, dirent.name));
      }
    });
    // 删除最外层文件夹
    fs.rmdirSync(path.resolve(dir));
  }
}

module.exports.unlinkAll = unlinkAll;