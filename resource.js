const archiver = require('archiver')
const fs = require('fs')

// // 读取版本号
// const manifestJSon = fs.readFileSync('./package.json', 'utf-8')
// const mainTextObj = JSON.parse(manifestJSon)
// // 版本号
// const version = mainTextObj.version

const output = fs.createWriteStream(`./app.zip`)
const archive = archiver('zip', {
  zlib: {
    level: 9 // 设置压缩等级
  }
})

archive.pipe(output)
archive.directory('./out') // 这里false参数和上面的ignoreBase为true效果一样
archive.directory('./resources')
archive.append(fs.createReadStream(__dirname + '/package.json'), { name: 'package.json' })
archive.finalize() // 完成压缩

archive.on('end', () => {
  // 压缩结束时触发
  console.log('压缩完成')
})
