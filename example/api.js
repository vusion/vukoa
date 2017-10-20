/**
 * The enum of test
 * @typedef {string} testStatus
 * @enum {test1} 成功
 * @enum {test2} 失败
 */

/**
 * The difination of userInfo
 * @typedef {object} userInfo
 * @property {string} userName - 用户名
 * @property {string} avatar - 头像资源类型
 * @property {string} isNotNce - 是否蜂巢用户标记
 * @property {string} status - 合法用户标记
 * @property {testStatus} hahaha - 测试状态参数
 */

/**
 * 获取用户信息
 * /api/v2/users/info
 * @param {number} testNum - just for param test
 * @return 200 #userInfo
 * @return 401 该用户不具备操作权限
 * @return 403 操作无效，请核对接口参数
 * @return 500 服务器内部错误
 */
