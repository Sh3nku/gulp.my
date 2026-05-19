import svgSprite from 'gulp-svg-sprite';

export const spriteSvg = () => {
    return app.gulp.src( app.path.src.svgicons )
        .pipe( app.gulp.dest( app.path.build.imagesIcon ) )
        .pipe(
            svgSprite({
                mode: {
                    stack: {
                        sprite: '../sprite.svg',
                        example: true
                    }
                }
            })
        )
        .pipe( app.gulp.dest( app.path.build.images ) )
}