export const images = () => {
    return app.gulp.src( app.path.src.images, { encoding: false } )
        .pipe( app.gulp.dest( app.path.build.images ) )
        .pipe( app.plugins.browsersync.stream() );
}