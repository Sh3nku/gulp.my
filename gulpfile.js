import gulp from 'gulp';
import { path } from './gulp/config/path.js'
import { plugins } from './gulp/config/plugins.js';

global.app = {
    path: path,
    gulp: gulp,
    plugins: plugins
}

import { copy } from './gulp/tasks/copy.js';
import { favicons } from './gulp/tasks/favicons.js';
import { reset } from './gulp/tasks/reset.js';
import { html } from './gulp/tasks/html.js';
import { server } from './gulp/tasks/server.js';
import { scss } from './gulp/tasks/scss.js'
import { js } from './gulp/tasks/js.js';
import { fonts } from './gulp/tasks/fonts.js';
import { spriteSvg } from './gulp/tasks/svgsprite.js';
import { images } from './gulp/tasks/images.js';
import { ftp } from './gulp/tasks/ftp.js';

function watcher() {
    gulp.watch( path.watch.files, copy );
    gulp.watch( path.watch.html, html );
    gulp.watch( path.watch.scss, scss );
    gulp.watch( path.watch.js, js );
    gulp.watch( path.watch.images, images );
}

const mainTasks = gulp.parallel( fonts, copy, favicons, html, scss, js, spriteSvg, images );

const dev = gulp.series( reset, mainTasks, gulp.parallel( watcher, server ) );
const deployFTP = gulp.series( ftp );

export { spriteSvg }
export { deployFTP }

gulp.task( 'default', dev );