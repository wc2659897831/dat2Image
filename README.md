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

*   递归的处理文件
*   不同层级显示/同层级显示
*   过滤缩略图
*   支持JPG/GIF/PNG的转换
*   反向编码成`.dat`文件

## 变量说明

| 变量名                      | 默认值 | 可选值   | 作用          |
| ------------------------ | ------ |-| ----------- |
| isDeep                   | true   |true/false |是否递归        |
| isFlat                   | false  |true/false |是否都处理到同一层级中 |
| startMode                | DECODE | DECODE/ENCODE|处理方式, 默认是解码 |
| eruptSimultaneouslyCount |  50000    |1-???| 操作数量限制, 如果操作的总数量超过50000, 建议再进行手动修改          |
| fileUint | KB |KB/MB/GB| 每个文件处理后显示的文件大小单位
| sumFileUint | MB |KB/MB/GB| 总文件大小显示的单位
| excludeDirs | ["Thumb", "humb"] | |排除的目录, 默认排除处理缩略图目录(Thumb)

## 使用

```shell
npm install
```

修改`index.js`文件中的`readDir`和`saveDir`

```shell
node index.js
```

## 案例
### 将dat文件解码成正常图片
使用默认配置即可

![image](https://github.com/wc2659897831/dat2Image/assets/60737437/83fd5b82-fbd7-47f0-90d6-752210aed3c7)

![image](https://github.com/wc2659897831/dat2Image/assets/60737437/10880003-a733-4605-8986-5348fe5779e1)

执行`index.js`文件, 就可以看到上面的输出
### 将JPG/GIF/PNG编码成dat文件
将`startMode`修改成`ENCODE`

![image](https://github.com/wc2659897831/dat2Image/assets/60737437/73b6072d-2b7f-462d-a2c5-26949005f8a9)

执行`index.js`文件, 就可以看到上面的输出
