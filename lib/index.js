/** @module index */
'use strict';

// Dependencies
const fs = require('fs');
const glob = require('glob');
const doctrine = require('doctrine');
const parser = require('swagger-parser');
const swaggerHelpers = require('./swagger-helpers');

const USUAL_PARAM_MAP = ['string', 'boolean', 'number'];

/**
 * Parses the provided API file for JSDoc comments.
 * @function
 * @param {string} file - File to be parsed
 * @returns {{jsdoc: array, yaml: array}} JSDoc comments and Yaml files
 * @requires doctrine
 */
const parseApiFile = function (file) {
    const jsDocRegex = /\/\*\*([\s\S]*?)\*\//gm;
    const fileContent = fs.readFileSync(file, { encoding: 'utf8' });
    const swaggerSpecs = [];

    const regexResults = fileContent.match(jsDocRegex);
    if (regexResults) {
        for (let i = 0; i < regexResults.length; i = i + 1) {
            const jsDocComment = doctrine.parse(regexResults[i], { unwrap: true, sloppy: true });
            let swaggerSpec;
            if (jsDocComment.tags && jsDocComment.tags[0].title === 'typedef') {
                // definitions定义（对象），另一个是parameters定义（参数字段）
                if (jsDocComment.tags.find((tag) => tag.title === 'property'))
                    swaggerSpec = transToDef(jsDocComment);
                else
                    swaggerSpec = transToParam(jsDocComment);
            } else
                swaggerSpec = transToSpec(jsDocComment);

            swaggerSpecs.push(swaggerSpec);
        }
    }

    return swaggerSpecs;
};

/**
 * 将jsDoc中的typedef转化为swagger中的对象定义
 * @param {string} jsDocComment
 */
const transToDef = function (jsDocComment) {
    const required = []; // 参数是否必填
    const properties = {}; // 参数列表
    const description = jsDocComment.description;
    const multiName = description && description.split(/\[(.+)\]/)[1]; // 复数的名称
    let type, name;

    jsDocComment.tags.forEach((tag) => {
        if (tag.title === 'property') {
            const property = {};
            // 为optional或非空参数时，取tag.type.expression.name
            let type = tag.type.name || tag.type.expression.name;
            // 非常用字段类型，则是自主定义的parameter
            if (!USUAL_PARAM_MAP.includes(type))
                type = '#/parameters/' + type;
            if (tag.type && tag.type.type === 'NonNullableType')
                required.push(tag.name);
            Object.assign(property, {
                type,
                default: tag.default,
                // todo:在description中添加额外的信息元
                description: tag.description,
            });
            properties[tag.name] = property;
        }
        if (tag.title === 'typedef') {
            type = tag.type.name.toLowerCase();
            name = tag.name;
        }
    });

    const ret = {
        definitions: {
            [name]: {
                type, description, required, properties,
            },
        },
    };

    if (multiName) {
        Object.assign(ret.definitions, {
            [multiName]: {
                type: 'array',
                item: {
                    $refs: '#/definitions/' + name,
                },
            },
        });
    }

    return ret;
};

/**
 * 获取jsDoc形式的参数定义中的额外信息（根据OpenAPI的标准）+ description
 * @param {string} description
 */
const splitParamDesc = function (description) {
    const regex = /\{(.*)\}/g;
    let extras;
    const regexResults = description.match(regex);
    if (!regexResults) {
        return {
            extras: null,
            description,
        };
    } else {
        // eslint-disable-next-line
        extras = eval('(' + regexResults[0] + ')');
        return {
            extras,
            description: description.split('}')[1].trim(),
        };
    }
};

/**
 * 
 * 处理jsDoc的单个参数数处理
 * @param {object} jsDocTag 
 * @returns 
 */
const processTag = function (jsDocTag) {
    const parameter = {};
    let description, extras;
    if (jsDocTag.description) {
        const ret = splitParamDesc(jsDocTag.description);
        extras = ret.extras;
        description = ret.description;
    }

    // param属性的required信息
    if (jsDocTag.type && jsDocTag.type.type === 'NonNullableType')
        parameter.required = true;
    // 默认值
    if (jsDocTag.default)
        parameter.default = jsDocTag.default;

    Object.assign(parameter, extras, {
        name: jsDocTag.name,
        type: jsDocTag.type.name || jsDocTag.type.expression.name,
        description,
    });

    // 参数的位置: query | path | header。默认是query. in也是extras信息中的一种
    if (!parameter.in)
        parameter.in = 'query';

    return parameter;
};

/**
 * 
 * 将jsDoc中的typedef转化为swagger中的parameters参数定义
 * @param {string} jsDocComment
 * @returns 
 */
const transToParam = function (jsDocComment) {
    const parameters = {};
    const tag = jsDocComment.tags[0];
    const { extras, description } = splitParamDesc(jsDocComment.description);
    const enums = jsDocComment.tags.filter((tag) => tag.title === 'enum')
        .map((tag) => tag.type.value || tag.type.name);
    // enum类型数据的定义
    if (enums.length > 0) {
        return {
            parameters: {
                [tag.name]: {
                    name: [tag.name],
                    type: tag.type.name || tag.type.expression.name,
                    enum: enums,
                },
            },
        };
    } else {
        return {
            parameters: {
                [tag.name]: Object.assign(processTag(tag), extras, { description }),
            },
        };
    }
};

/**
 * 将doctrine生成的jsDoc的json信息，转化为swagger specification
 * @param {any} jsDocComment
 */
const transToSpec = function (jsDocComment) {
    // 接口的description、url、method
    let description = '', url = '', method = 'get';
    // 接口的请求参数列表，请求返回列表（针对不同的code）
    const parameters = [];
    const responses = {};
    const tags = [];
    const commentDescs = jsDocComment.description.split('\n');

    // 至少需要有接口的description和url信息
    if (!commentDescs)
        throw new Error('需要表明接口的description和url信息');

    // method默认为'get'，可不填
    if (commentDescs.length > 2) {
        [description, url, method] = commentDescs;
        method = method.toLowerCase();
    } else
        [description, url] = commentDescs;

    jsDocComment.tags.forEach((tag, index) => {
    // 参数
        if (tag.title === 'param') {
            let parameter = {};
            // 参数的额外信息
            const isUsualParam = (tag.type && tag.type.name && USUAL_PARAM_MAP.includes(tag.type.name.toLowerCase()))
              || (tag.type && tag.type.expression && USUAL_PARAM_MAP.includes(tag.type.expression.name.toLowerCase()));

            if (isUsualParam) // 一般变量的声明方式
                parameter = processTag(tag);
            else // 公共的变量声明
                parameter.$ref = '#/parameters/' + tag.type.name;

            parameters.push(parameter);
        }

        if (tag.title === 'return') {
            const response = {};
            const [httpCode, description] = tag.description.split(' ');
            // 200的正常返回
            if (description.startsWith('#')) {
                response[httpCode] = {
                    // 默认description.
                    // todo: 确认是否需要有自定制的描述
                    description: '正常返回',
                    schema: {
                        $ref: '#/definitions/' + description.slice(1),
                    },
                };
                tags.push(description.slice(1));
            } else
                response[httpCode] = { description };

            Object.assign(responses, response);
        }
    });

    return {
        [url]: {
            [method]: {
                description, parameters, responses, tags,
            },
        },
    };
};

/**
 * Converts an array of globs to full paths
 * @function
 * @param {array} globs - Array of globs and/or normal paths
 * @return {array} Array of fully-qualified paths
 * @requires glob
 */
const convertGlobPaths = function (globs) {
    return globs.reduce((acc, globString) => {
        const globFiles = glob.sync(globString);
        return acc.concat(globFiles);
    }, []);
};

/**
 * Generates the swagger spec
 * @function
 * @param {object} options - Configuration options
 * @returns {array} Swagger spec
 * @requires swagger-parser
 */
module.exports = function (options) {
    /* istanbul ignore if */
    if (!options)
        throw new Error('\'options\' is required.');
    else /* istanbul ignore if */ if (!options.swaggerDefinition) 
        throw new Error('\'swaggerDefinition\' is required.');
    else /* istanbul ignore if */ if (!options.apis) 
        throw new Error('\'apis\' is required.');

    // Build basic swagger json
    let swaggerObject = swaggerHelpers.swaggerizeObj(options.swaggerDefinition);
    const apiPaths = convertGlobPaths(options.apis);

    // Parse the documentation in the APIs array.
    for (let i = 0; i < apiPaths.length; i = i + 1) {
        const files = parseApiFile(apiPaths[i]);
        swaggerHelpers.addDataToSwaggerObject(swaggerObject, files);
    }

    /**
     * [{
     *  single: 'pet',
     *  multi: 'pets',
     * }, {
     *  single: 'XXX',
     *  multi: 'xxxs',
     * }]
     */
    const MULTI_MAP = [];
    parser.parse(swaggerObject, (err, api) => {
        if (!err)
            swaggerObject = api;
    });

    for (const definitionName in swaggerObject.definitions) {
        const definition = swaggerObject.definitions[definitionName];
        const multiName = definition.description && definition.description.split(/\[(.+)\]/)[1];
        if (multiName) {
            MULTI_MAP.push({
                single: definitionName,
                multi: multiName,
            });
        }
    }

    for (const pathName in swaggerObject.paths) {
        const path = swaggerObject.paths[pathName];
        for (const methodName in path) {
            const method = path[methodName];
            const index = MULTI_MAP.findIndex((item) => item.single === method.tags[0]);
            if (index !== -1) {
                method.tags[0] = MULTI_MAP[index].multi;
                method.description = '[' + MULTI_MAP[index].single + ']' + method.description;
            }
        }
    }

    return swaggerObject;
};
