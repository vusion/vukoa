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
    - `-b, --openBrowser`: 'Whether or not to open default browser to show the doc.'
    - `-w, --watch`, 'Whether or not to listen for continous changes.'
    - `-m, --mock`, 'Whether or not to used by vukoa-mock command.'
- `vukoa mock`: start the mock server
    - `-e, --error`, 'Start the error case for mock server.'

## Configuration

``` js
{
    type: '',                       // Project type
    root: '',                       // Project root
    port: 8000,                     // Server port
    entry: '',                      // Server start entry
    controller: '',                 // Controller path
    routes: '',                     // Routes path
    specification: '',               // basic infos in swagger specification(Optional)
    mockPath: '',                       // the depends files dir for mockServer(Optional: __dirname/mock)
};
```

## todo: vukoa-doc

最终文案的可视化，因为文件存在本地，需要起一个本地的服务。之后也需要讨论如何整理进vukoa的配置当中。

## vukoa-mock

- 添加某项
```
curl -d 'name=mimi&&tag=cat' 'localhost:8000/pets'
```

- 删除某项
```
curl -X DELETE localhost:8000/pets/2
```

note: 如果列表中为空，则新添加的项自动添加的id为从1开始。如果列表不为空，则新添加项的id为已有项中最大的id数+1.
