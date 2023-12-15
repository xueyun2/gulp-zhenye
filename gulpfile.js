const { src, dest, series, watch, parallel } = require('gulp');
const sass = require('gulp-sass')(require('sass')); //scss文件编译成css
const autoPrefixer = require('gulp-autoprefixer'); //给css自动添加前缀兼容
const htmlmin = require('gulp-htmlmin'); //压缩Html
const uglify = require('gulp-uglify'); //压缩js子支持ES5压缩
const babel = require('gulp-babel'); //ES6转ES5
const cleanCSS = require('gulp-clean-css'); //html压缩内置style
const webserver = require('gulp-webserver'); //本地服务
const fileinclude = require('gulp-file-include'); //引入静态模板
const npmDist = require('gulp-npm-dist'); //打包依赖
const useref = require('gulp-useref'); //打包html中引入的依赖包
const replace = require('gulp-replace'); //处理路径可以用正则匹配
const gulpif = require('gulp-if'); //gulp条件语句
const sourcemaps = require('gulp-sourcemaps'); //源映射
const postcss = require('gulp-postcss'); //转换css代码
const eslint = require('gulp-eslint'); //代码检查
//忽略HTML中的PHP模板语法或者其他的模板语法
const Fragments = [/\{\{(.+?)\}\}/g]; //{{}}
//当前打包模式
const ENV = process.env.NODE_ENV;
//忽略文件
const filterHtml = ['!src/app/**/component/*.html'];
//匹配文件入口
const JS_SRC = 'src/access/static/**/*.js';
const SASS_SRC = 'src/access/static/**/*.scss';
const CSS_SRC = 'src/access/static/**/*.css';
const OTHER_SRC =
  'src/access/static/**/*.{eot,svg,ttf,woff,woff2,json,png,jpg,gif}';
const HTML_SRC = 'src/app/**/*.html';
//输入目录
const STATIC = './access/static/'; //静态资源目录
const VIEWS = './app/'; //html目录
//自动打包依赖
function atuoRelyTask() {
  return src(npmDist(), { base: './node_modules/' }).pipe(dest(STATIC + 'lib'));
}
//监听文件，运行指定任务。
function watchFile() {
  watch(JS_SRC, jsTask);
  watch(CSS_SRC, cssTask);
  watch(SASS_SRC, scssTask);
  watch(OTHER_SRC, otherTask);
  watch(HTML_SRC, parallel(htmlTask, cssTask));
}
//创建本地服务
function server() {
  return src('/').pipe(
    webserver({
      livereload: true, //文件修改自动刷新
      host: 'localhost',
      port: 9900,
      open: '/app/views/home/index.html' //要打开的页面，指向打包成功后的文件目录
    })
  );
}
//打包js
function jsTask() {
  return src(JS_SRC)
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError())
    .pipe(gulpif(ENV != 'production', sourcemaps.init()))
    .pipe(
      babel({
        presets: ['@babel/env']
      })
    )
    .pipe(
      uglify({
        output: {
          ascii_only: true //把中文转换成Unicode编码
        }
      })
    )
    .pipe(gulpif(ENV != 'production', sourcemaps.write()))
    .pipe(dest(STATIC));
}
//打包scss
function scssTask() {
  return src(SASS_SRC)
    .pipe(gulpif(ENV != 'production', sourcemaps.init()))
    .pipe(sass({ outputStyle: 'compressed' }).on('error', sass.logError))
    .pipe(
      autoPrefixer(
        'last 3 version',
        'safari 5',
        'ie 6-9',
        'chrome 62',
        'opera 48',
        'edge 16'
      )
    )
    .pipe(cleanCSS())
    .pipe(gulpif(ENV != 'production', sourcemaps.write()))
    .pipe(dest(STATIC));
}
//打包css
function cssTask() {
  return src(CSS_SRC)
    .pipe(gulpif(ENV != 'production', sourcemaps.init()))
    .pipe(postcss())
    .pipe(
      autoPrefixer(
        'last 3 version',
        'safari 5',
        'ie 6-9',
        'chrome 62',
        'opera 48',
        'edge 16'
      )
    )
    .pipe(cleanCSS())
    .pipe(gulpif(ENV != 'production', sourcemaps.write()))
    .pipe(dest(STATIC));
}
//复制图片字体资源
function otherTask() {
  return src(OTHER_SRC).pipe(dest(STATIC));
}
//打包HTML
function htmlTask() {
  return (
    src([HTML_SRC, ...filterHtml])
      .pipe(
        fileinclude({
          prefix: '@@',
          basepath: '@file'
        })
      )
      //修改打包模式下去掉路径中的access
      .pipe(gulpif(ENV === 'production', replace(/\/access\//g, '/')))
      .pipe(
        htmlmin({
          collapseWhitespace: true, //html压缩成一行
          minifyJS: function(text){
            let jsCode = uglify(text)
            return jsCode
          } , //压缩内嵌js无法压缩ES6语法
          minifyCSS: cleanCSS({ compatibility: 'ie8' }), //压缩html中的css
          removeComments: true, //删除html中的注释
          removeEmptyAttributes: true, //删除包空的节点属性
          trimCustomFragments: true, //修剪周围空格
          ignoreCustomFragments: Fragments, //允许在匹配时忽略某些片段的正则表达式数组（例如<?php ... ?>、{{ ... }}等）
          minifyURLs: true
        })
      )
      .pipe(dest(VIEWS))
  );
}
//打包上线模式
function bulid() {
  return parallel(
    watchFile,
    series(jsTask, cssTask, scssTask, otherTask, atuoRelyTask, htmlTask)
  );
}
//开发者模式
function dev() {
  return parallel(
    watchFile,
    series(jsTask, cssTask, scssTask, otherTask, atuoRelyTask, htmlTask, server)
  );
}
exports.default = process.env.NODE_ENV === 'production' ? bulid() : dev();
