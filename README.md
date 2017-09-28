# Vukoa

Vue + Koa

[![NPM Version][npm-img]][npm-url]
[![Dependencies][david-img]][david-url]
[![NPM Download][download-img]][download-url]

[npm-img]: http://img.shields.io/npm/v/vukoa.svg?style=flat-square
[npm-url]: http://npmjs.org/package/vukoa
[david-img]: http://img.shields.io/david/vusion/vukoa.svg?style=flat-square
[david-url]: https://david-dm.org/vusion/vukoa
[download-img]: https://img.shields.io/npm/dm/vukoa.svg?style=flat-square
[download-url]: https://npmjs.org/package/vukoa

## Install

``` shell
npm install -g vukoa
```

## Quick Start

## Commands

- `vukoa help`: Show help of all commands
- `vukoa -V, --version`: Show the version of current CLI

- `vukoa init <project-name>`: Initalize a vukoa project
- `vukoa start`: Start server
    - `-b, --open-browser`: Open browser when start server
    - `-B, --build`: Build files in the beginning
    - `-p, --port <port>`: Web Server Port
- `vukoa dev`: Start server with webpack dev middleware
    - `-b, --open-browser`: Open browser when start server
    - `-p, --port <port>`: WebpackDevServer port in dev mode
- `vukoa doc`: Generate Document By jsDoc
    - `-d, --definition <swaggerDef.js>`, 'Input swagger definition.'
    - `-o, --output [swaggerSpec.json]`, 'Output swagger specification.'
    - `-w, --watch`, 'Whether or not to listen for continous changes.'
    - `-a, --args <api.js>`, 'api doc files.'

## Configuration

``` js
{
    type: '',                       // Project type
    root: '',                       // Project root
    port: 8000,                     // Server port
    entry: '',                      // Server start entry
    controller: '',                 // Controller path
    routes: '',                     // Routes path
};
```

## todo: vukoa-doc

`-d`的参数需要集合到vukoaConfig当中。

目前使用vukoa-doc必然需要添加参数。使用如下：
`vukoa-doc -d example/swaggerDef.js`

swaggerDef的参数配置参照`example/swaggerDef.js`.

最终文案的可视化，因为文件存在本地，需要起一个本地的服务。之后也需要讨论如何整理进vukoa的配置当中。