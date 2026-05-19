export const server = ( done ) => {
    app.plugins.browsersync.init({
        /*server: {
            baseDir: app.path.build.html
        },*/
        proxy: 'http://myGulp',
        notify: false,
        port: 3001
    });
}