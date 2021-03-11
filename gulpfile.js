const {src,dest,watch,series} = require('gulp')
const sass = require('gulp-sass')
const include = require('gulp-file-include')
const csso = require('gulp-csso')
const htmlmin = require('gulp-htmlmin')
const del = require('del')
const concat = require('gulp-concat')
const autoprefixer = require('gulp-autoprefixer')
const sync = require('browser-sync').create()
const media = require('gulp-group-css-media-queries')
const rename = require('gulp-rename')
const uglify = require('gulp-uglify-es').default
const imagemin = require('gulp-imagemin')
const webp = require('gulp-webp')
// const webp = require('webp-converter')
const webphtml = require('gulp-webp-html')
// const webpcss = require('gulp-webpcss')
const babel = require('gulp-babel')
// const sourcemaps = require('gulp-sourcemaps')

function html() {
    return src('src/**.html')
            .pipe(include({
                prefix: '@@'
            }))
            .pipe(webphtml())
            .pipe(htmlmin({
                collapseWhitespace: false
            }))
            .pipe(dest('dist'))
}
function fonts() {
    return src('src/fonts/**/*')
            .pipe(dest('dist/fonts'))
}
function js() {
    return src('src/js/**.js')
            .pipe(include())
            .pipe(concat('main.js'))
            .pipe(babel({
                presets: ['@babel/env']
            }))
            .pipe(dest('dist/js'))
            .pipe(uglify())
            .pipe(rename({
                extname:'.min.js'
            }))
            .pipe(dest('dist/js'))
}

function images() {
    return src('src/img/**/*.{jpg,png,svg,gif,ico,webp}')
            .pipe(webp({
                quality: 70
            }))
            .pipe(dest('dist/img'))
            .pipe(src('src/img/**/*.{jpg,png,svg,gif,ico,webp}'))
            .pipe(imagemin({
                progressive: true,
                svgoPlugins:[{ removeViewBox: false }],
                interlaced: true,
                optimizationLevel: 3
            }))
            .pipe(dest('dist/img'))
}

function copy() {
    return src('src/media/**/*.*')
            .pipe(dest('dist/media'))
}

function scss() {
    return src('src/scss/**.scss')
            .pipe(sass())
            .pipe(media())
            .pipe(autoprefixer({
                overrideBrowserslist: ['last 5 versions'],
                cascade: true
            }))
            // .pipe(webpcss())
            .pipe(concat('main.css'))
            .pipe(dest('dist/css'))
            .pipe(csso())
            .pipe(rename({
                extname:'.min.css'
            }))
            .pipe(dest('dist/css'))
}

function clear(){
    return del('dist')
}

function serve(){
    sync.init({
        server: './dist',
        port: 3000,
        browser: 'chrome',
        notify: false
    })
    watch('src/templates/**.html',series(html)).on('change',sync.reload)
    watch('src/**.html',series(html)).on('change',sync.reload)
    watch('src/scss/**.scss',series(scss)).on('change',sync.reload)
    watch('src/js/**.js',series(js)).on('change',sync.reload)
}

exports.build = series(clear,fonts,scss,js,images,copy,html)
exports.serve = series(clear,fonts,scss,js,images,html,copy,serve)