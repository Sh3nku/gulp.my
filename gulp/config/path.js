import * as nodePath from 'path';
const rootFolder = nodePath.basename(nodePath.resolve());

const buildFolder = `./build`;
const srcFolder = `./src`

export const path = {
    build: {
        html: `${buildFolder}`,
        favicons: `${buildFolder}/favicons/`,
        files: `${buildFolder}/files/`,
        css: `${buildFolder}/css/`,
        js: `${buildFolder}/js/`,
        fonts: `${buildFolder}/fonts/`,
        images: `${buildFolder}/images/`,
        imagesIcon: `${buildFolder}/images/icons/`
    },
    src: {
        html: `${srcFolder}/*.html`,
        favicons: `${srcFolder}/favicons/**/*.*`,
        files: `${srcFolder}/files/**/*.*`,
        scss: `${srcFolder}/scss/style.scss`,
        js: `${srcFolder}/js/**/*.*`,
        fonts: `${srcFolder}/fonts/*.{ttf,eot,woff,woff2}`,
        images: `${srcFolder}/images/**/*.{jpg,jpeg,png,svg}`,
        svgicons: `${srcFolder}/svgicons/*.svg`
    },
    watch: {
        html: `${srcFolder}/**/*.html`,
        files: `${srcFolder}/files/**/*.*`,
        scss: `${srcFolder}/scss/**/*.{scss,sass,css}`,
        js:  `${srcFolder}/js/**/*.js`,
        images: `${srcFolder}/images/**/*.{jpg,jpeg,png}`
    },
    clean: buildFolder,
    buildFolder: buildFolder,
    srcFolder: srcFolder,
    rootFolder: rootFolder,
    ftp: ``
};