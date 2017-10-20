module.exports = {
    type: 'app',
    root: __dirname,
    port: 8000,
    entry: '',
    controller: ['./example/*.js'],
    routes: '',
    specification: {
        info: {
            title: 'Hello World',
            version: '1.0.0',
            description: 'A sample API',
        },
        basePath: '/',
    },
    mockPath: './mock',
};
