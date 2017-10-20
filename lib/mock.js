// Dependencies
const fs = require('fs');
const path = require('path');
const shelljs = require('shelljs');
const chokidar = require('chokidar');
const swaggerObject = require('./index.js');
const jsf = require('json-schema-faker');
// 为相对位置
const { mockPath, root } = global.vukoaConfig = require('../config/resolve')();
const swaggerJSONPath = path.resolve(root, mockPath, 'swaggerSpec.json');

const toSchemaWithNoSwaggerSpec = function (hasSwaggerSpec) {
    // shelljs.exec()为同步执行.但是其中的脚本的执行不清楚同步情况
    // shelljs.exec()可以通过stdout获取到内部执行脚本通过`console.log()`输出的内容。
    // stderr则是捕获的`console.error()`的内容
    let swaggerSpec = JSON.parse(shelljs.exec(`./bin/vukoa-doc -m`).stdout);
    // eslint-disable-next-line
    swaggerSpec = eval('(' + swaggerSpec + ')');
    return toSchemaWithSwaggerSpec(swaggerSpec);
};
/**
 * 通过swagger Specification 内容获取生成schema的源信息
 * @param {object} swaggerSpec - swagger specification json对象
 * @return schema.json的源信息，其他信息
 */
const toSchemaWithSwaggerSpec = function (swaggerSpec) {
    if (!swaggerSpec)
        swaggerSpec = require(swaggerJSONPath);

    const { definitions, paths, parameters } = swaggerSpec;
    const schemas = {};
    let hasNormalReturn = false; // 一个请求是否有标示正常的返回。即2xx时的返回

    // 正常的接口返回
    for (let defName in definitions) {
        const definition = definitions[defName];
        let multiName;
        // 复数的定义直接跳过
        if (definition.type === 'array')
            continue;
        // 将有复数的defName替换为复数形态
        if (definition.description.startsWith('['))
            multiName = definition.description.split(/\[(.+)\]/)[1];
        // 重置
        definition.required = [];
        // swagger定义中的required和json-schema-faker的定义不太一致。
        // json-schema-faker中的required需要为true,才会必然在mock数据中生成。
        for (const propertyName in definition.properties)
            definition.required.push(propertyName);

        // jsf()可以同步生成对应的mock结果
        // schema的结构大致如下：
        /**
         * {
         *      instance1 + s: [
         *          {
         *              "id": 1,
         *              "key1": "value1",
         *              "key2": "value2",
         *              "key3": "value3",   
         *              xxx
         *          }, {
         *              "id": 2,    
         *              xxxx
         *          }
         *      ],  
         *      xxx
         * }
         */ 
        for (const propertyName in definition.properties) {
            const property = definition.properties[propertyName];
            if (property.$ref) {
                const paramName = property.$ref.split('#/parameters/')[1];
                const param = parameters[paramName];
                property.$ref = '#/definitions/' + paramName;

                // swagger spec中会额外注明enum类型的数据类型
                if (param.enum)
                    delete param.type;

                definition.definitions = {};
                definition.definitions[paramName] = param;
            }
        }

        const schema = jsf(definition);

        if (multiName)
            defName = multiName;

        schemas[defName] = [];
        // json-server需要id这个字段
        schemas[defName].push(Object.assign(schema, { id: 1 }));
    }

    // 异常接口返回
    for (const pathName in paths) {
        const path = paths[pathName];
        for (const methodName in path) {
            const method = path[methodName];
            const responses = method.responses;
            let instanceName;

            for (const responseCode in responses) {
                const response = responses[responseCode];

                if (/^2/.exec(responseCode)) {
                    if (!response.schema.$ref)
                        throw new Error('正常的返回中必须通过$ref定义有对应的数据实例');

                    instanceName = response.schema.$ref.split('definitions/')[1];
                    hasNormalReturn = true;
                }
            }

            if (!hasNormalReturn)
                throw new Error('一个请求必须有正常返回下的定义，即2xx时的接口返回');

            for (let responseCode in responses) {
                if (!responseCode.startsWith('2')) {
                    const desc = responses[responseCode].description;
                    // 默认为500的code错误码
                    if (isNaN(+responseCode))
                        responseCode = '500';
                    schemas[`${instanceName}-${methodName}-${responseCode}`] = {
                        code: responseCode,
                        msg: desc,
                    };
                }
            }
        }
    }

    return {
        schemas,
        paths,
    };
};

module.exports = function (hasSwaggerSpec = false) {
    return hasSwaggerSpec ? toSchemaWithSwaggerSpec() : toSchemaWithNoSwaggerSpec();
};
