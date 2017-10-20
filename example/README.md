# 注释添加规则



## 一个完整的接口相关的文件定义

- 第一行是接口的注释
- 第一行是接口的方式：大小写皆可，如果是`get`方法，则可不写
- 第三行是接口的url，如遇到在接口中的参数传递，则通过':'表明对应的字段，一个完整的例子： `/api/:userName/save`
- 通过`@param`标签定义一个接口传参，`{}`中可以添加`!`标注一个必填的传参，通过`-`来分割参数名和参数注释，`-`前后最好由空格隔开
- 通过`@return`标签定义接口的一个返回情况，200默认认为是正常返回，其注释为‘#’ + 数据实例（一般为复数形式）。其他的情形下默认认为是失败返回，前端需要获取的信息就是错误码 + 错误信息



```
/**
 * 获取用户信息
 * [method: get | post ...]  
 * /api/v2/users/info
 * @param {number} testNum - just for param test
 * @param {testType} type  - the type for the test
 * @return 200 #userInfo
 * @return 401 该用户不具备操作权限
 * @return 403 操作无效，请核对接口参数
 * @return 500 服务器内部错误
 */
```

## 一个数据实例的定义

数据实例一定是一个对象类型

- 第一行是数据实例的定义
- 通过`@typedef`定义一个数据实例，包括类型和实例的名称
- 通过`@property`顶一个数据实例的字段，包括：类型 + 字段名 + 注释。注释和字段名之间通过`-`隔开。这里不需要定义必传、选传等信息。

```
/**
 * The difinition of userInfo
 * @typedef {object} userInfo
 * @property {string} userName - 用户名
 * @property {string} avatar - 头像资源类型
 * @property {string} isNotNce - 是否蜂巢用户标记
 * @property {string} status - 合法用户标记
 * @property {testStatus} hahaha - 测试状态参数
 */
```

数据实例：实例：增、删、查（单个&列表）、改操作的主体。

## enum类型数据定义

目前enum的数据类型仅限于基本数据类型[string, number, boolean].

- 第一行是enum类型数据的注释
- 第二行通过`@typedef`注明enum数据的数据类型和名称
- 接下来通过`@enum`来定义数据的可选值和注释

```
/**
 * The enum of test
 * @typedef {string} testStatus
 * @enum {test1} 成功
 * @enum {test2} 失败
 */
```

## 特别注释的参数

在实例对象定义和接口传参中，都有表明为特殊的普通类型的参数，主要是为了能够复用。

- 第一行为注释
- 第二行通过`@typedef`定义参数的类型和参数名。注释部分通过`{}`来标明参数的一些其他设置。使用时，通过','分割具体的元信息【具体参看`./lib/README.md`或者swagger的官网】。整体的书写方式和对象相同。

```
/**
 * Number of persons returned
 * @typedef {number} {in: 'path'}testType
 */
```