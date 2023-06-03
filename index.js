const fs = require('fs');
const path = require('path');
const async = require('async');

const ENCODE = 'encode' // 编码
const DECODE = 'decode' // 解码
const ENCODE_KEY = 0xEE // 编码密钥
// SOI文件头的映射表
const SOIMap = {
  JPG: [0xFF, 0xD8],
  GIF: [0x47, 0x49],
  PNG: [0x89, 0x50],
}

const isDeep = true // 是否递归
const startMode = DECODE // ENCODE | DECODE
const eruptSimultaneouslyCount = 50 // 并行操作数量限制
// 读取文件目录
let readDir = 'D:/Desktop/test';
// 保存文件目录
let saveDir = 'D:/Desktop/testResult';

const readFileArr = []; // 存储读取的文件
const dirQueue = [] // 目录队列
let sumResolveFileCount = 0 // 总共要处理的文件数量
let resolveFileCount = 0 // 处理文件数量统计
let errorFile = [] // 错误文件统计

/**
 * 
 * @param {*} dir 相对路径
 * @param {*} absPath 绝对路径
 * @param {*} isFirst 是否第一次进入函数
 */
function readFile(dir, absPath, isFirst) {
  // 拼接路径
  const jointDir = item => isFirst ? item : `${dir}/${item}`
  // 读取文件路径
  const readFileDir = isFirst ? `${absPath}${dir}` : `${absPath}/${dir}`
  // 读取文件后遍历
  fs.readdirSync(readFileDir).forEach(item => {
    const isDirectory = fs.lstatSync(path.join(readFileDir, item)).isDirectory()
    if (isDirectory) {
      dirQueue.push(jointDir(item))
    } else if (path.extname(item) == '.dat') {
      readFileArr.push(jointDir(item))
      sumResolveFileCount++
    }
  })
  if (isDeep) {
    if (dir === dirQueue[0]) dirQueue.shift() // 当前如果是队列头, 就出列
    if (dirQueue.length) readFile(dirQueue[0], absPath, false) // 判断队列是都还有值
  }
}

function batchDecode() {
  // 读取文件
  readFile('', readDir, true)

  // 批量解码
  async.mapLimit(readFileArr, eruptSimultaneouslyCount, decode, (res, err) => {
    console.log("错误文件数量:", errorFile.length)
    console.log("错误文件列表:", errorFile)
    // err && process.exit(0)
  })
}

function batchEncode() {
  const files = fs.readdirSync(readDir)
  const fileTypeList = Object.keys(SOIMap).map(str => `.${str.toLocaleLowerCase()}`)
  files.forEach(item => {
    const findResult = fileTypeList.indexOf(path.extname(item))
    if (findResult > -1) {
      readFileArr.push(item)
      sumResolveFileCount++
    }
  })

  // 批量编码
  async.mapLimit(readFileArr, eruptSimultaneouslyCount, encode, () => {
    // err && process.exit(0)
  })
}

function decode(item, cb) {
  let saveFileType = 'jpg' // 文件类型, 默认jpg
  // 读取绝对路径
  let readAbsPath = path.join(readDir, item);
  // 读取文件
  fs.readFile(readAbsPath, (err, content) => {
    if (err) {
      console.log(err);
      cb(err);
    }
    // firstBuf和nextBuf 是 读取文件的文件头
    const [firstBuf, nextBuf] = content
    // 读取文件的头文件跟jpg/gif/png这些文件头进行异或
    let secretKey = "" // 密钥
    for (const [fileType, headerBuf] of Object.entries(SOIMap)) {
      const firstVal = firstBuf ^ headerBuf[0]
      const nextVal = nextBuf ^ headerBuf[1]
      // 根据判断 头文件的两个值是否相等, 相等就是密钥, 就可以区分出对应类型
      if (firstVal == nextVal) {
        saveFileType = fileType.toLocaleLowerCase() // 得到对应文件头的类型
        secretKey = firstVal
        break
      }
    }

    // 匹配不到密钥 就提示错误
    if (!secretKey) {
      // console.error(item + " <- 该文件不是jpg/gif/png的微信.dat加密文件");
      sumResolveFileCount-- // 要处理的总数量-1 不然会影响进度计算
      errorFile.push(readAbsPath.replace(/\\/g, '\\'))
      return
    }

    // 写入绝对路径
    let saveAbsPath = path.join(saveDir, item.replace(".dat", "") + `.${saveFileType}`);
    // 创建对应的文件目录
    const filePath = saveAbsPath.substring(0, saveAbsPath.lastIndexOf('\\')).replace(/\\/g, "\/")
    // 检测目录是否存在, 并创建
    filePath.split("/").reduce((pre, item, index) => {
      let lastResult = pre[pre.length - 1] ?? ""
      lastResult = lastResult && lastResult + "/"
      pre.push(lastResult + item.trim())
      return pre
    }, []).forEach(path => !(fs.existsSync(path + "/")) && fs.mkdirSync(path + "/"))

    // 解码后保存文件
    fs.writeFileSync(saveAbsPath, content.map(br => br ^ secretKey))
    resolveFileCount++

    // 计算进度
    const val = resolveFileCount / sumResolveFileCount * 100
    console.log(`已经解码: ${resolveFileCount}/${sumResolveFileCount} ${val.toFixed(2)}%`)

    // 输出计算完毕的结果输出
    if (resolveFileCount == sumResolveFileCount) cb(true)
  })
}

function encode(item, cb) {
  let readAbsPath = path.join(readDir, item); // 读取绝对路径
  const resolveItem = item.substring(0, item.lastIndexOf('.')) // 去掉后缀
  let saveAbsPath = path.join(saveDir, resolveItem + `.dat`); // 写入绝对路径
  // 读取文件
  fs.readFile(readAbsPath, (err, content) => {
    if (err) {
      console.log(err);
      cb(err);
    }
    fs.writeFileSync(saveAbsPath, content.map(br => br ^ ENCODE_KEY))
    resolveFileCount++

    // 计算进度
    const val = resolveFileCount / sumResolveFileCount * 100
    console.log(`已经编码: ${resolveFileCount}/${sumResolveFileCount} ${val.toFixed(2)}%`)

    cb(null);
  })
}

function main() {
  startMode == ENCODE && batchEncode()
  startMode == DECODE && batchDecode()
}

(main)()
