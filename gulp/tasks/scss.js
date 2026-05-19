import * as  dartSass from 'sass';
import gulpSass from 'gulp-sass';
import autoprefixer from 'gulp-autoprefixer';

const sass = gulpSass( dartSass );

export const scss = () => {
    return app.gulp.src(app.path.src.scss, { sourcemaps: true })
        .pipe(
            sass({
                outputStyle: 'expanded'
            })
        )
        .pipe(
            autoprefixer({
                grid: true,
                overrideBrowserlist: ['last 3 version'],
                cascade: true
            })
        )
        .pipe(app.gulp.dest(app.path.build.css))
        .pipe(app.plugins.browsersync.stream())
}