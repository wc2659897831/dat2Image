# dat2Image
用于将微信加密的dat文件格式转换成正常的图片文件格式(jpg/gif/png)
## 原理
微信加密的文件, 文件大小没有变化, 说明只是一种编码的变换
微信使用的是`异或加密`
我们只要得到原本文件的文件头和加密后的文件头, 然后进行异或, 就可以得到密钥

假设加密文件的文件头是`11 36`, 跟jpg的`FF D8`文件头异或后的数据是`0xEE`, 异或后两个文件头是相等的是密钥, 那么`0xEE`就是密钥

异或后两个文件头是相等的才是密钥, 就可以区分不同的文件类型(这个特性是随着密钥而变化, 目前是相同)

把这个密钥把全部数据异或一遍的结果, 就可以解密数据

如果要加密数据, 就是把密钥去遍历全部数据

## 微信目录说明
在2022年6月之前的文件都是单独的按照日期保存

2022年6月之后(包含)的文件就被存放在`MsgAttach`目录下, 然后有一层哈希名的目录, 等于把图片都根据哈希去存放

`Thumb`文件夹存放的是图片缩略图

## 支持的功能
- 递归的处理文件
- 过滤缩略图
- 支持JPG/GIF/PNG的转换
- 反向编码成`.dat`文件

## 使用
```shell
npm install
node index.js
```

`index.js`中设置下图的两个变量, 就可以控制`读取的目录`和`输出的目录`

![image](https://github.com/wc2659897831/dat2Image/assets/60737437/4502102a-951b-4b73-9e64-f4264f858bdf)

设置`startMode`, `ENCODE`就是解密`dat`文件, `ENCODE`是加密成`dat`文件

![image](https://github.com/wc2659897831/dat2Image/assets/60737437/979e6e00-3f32-409e-beb3-c9340f12e8ff)
