/**
 * [pets] The difination of pet
 * @typedef {object} pet
 * @property {!number} id - 唯一标示
 * @property {!string} name - 名称
 * @property {string} tag - 标签
 */

/**
 * 获取宠物信息
 * /pets/:petId
 * @param {!string} petId - The id of the pet to retrieve
 * @return 200 #pet
 * @return default 默认错误
 */

/**
 * 获取宠物信息列表
 * /pets
 * @param {string} [limit = '20'] - How many items to return at one time (max 100)
 * @return 200 #pets
 * @return default 复数的操作错误
 */
