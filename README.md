
# 1. Gulp构建前端自动化

- [1. Gulp构建前端自动化](#1-gulp构建前端自动化)
  - [1.1. 常用API基础用法](#11-常用api基础用法)
  - [1.2. 常用插件](#12-常用插件)
    - [1.2.1. gulp-sass](#121-gulp-sass)
    - [1.2.2. gulp-uglifycss](#122-gulp-uglifycss)
    - [1.2.3. gulp-autoprefixer@8.0.0](#123-gulp-autoprefixer800)
    - [1.2.4. gulp-htmlmin，gulp-clean-css，gulp-file-include](#124-gulp-htmlmingulp-clean-cssgulp-file-include)
      - [1.2.4.1. gulp-file-include](#1241-gulp-file-include)
    - [1.2.5. gulp-uglify，babel，@babel/preset-env](#125-gulp-uglifybabelbabelpreset-env)
    - [1.2.6. gulp-webserver](#126-gulp-webserver)
    - [1.2.7. gulp-npm-dist](#127-gulp-npm-dist)
    - [1.2.8. gulp-replace，gulp-if，cross-env](#128-gulp-replacegulp-ifcross-env)

文档地址：<https://www.gulpjs.com.cn/>

## 1.1. 常用API基础用法

在通过`gulp.src()`匹配要打包的文件路径后可以链式调用`pipe()`管道函数。**一切代码压缩处理输出都是在管道函数中完成**。

- `gulp.src`：匹配路径
- `gulp.dest`：输出路径
- `gulp.watch`：监听文件变化执行指定任务
- `gulp.series`：按顺序执行多个任务，前面任务执行完成才进行下一个任务。
- `gulp.parallel`：多个任务并行执行，嵌套组合的深度没有强制限制。

``` JavaScript
const { src, dest, watch,series} = require('gulp');
//匹配`input/`路径下的所有`js`文件，输入出到`output`目录下
function copyTask() {
  return src('input/*.js')
    .pipe(dest('output/'));
}
//监听`input/`目录下的`js`如果有修改执行`copyTsk`任务。
function watch(){
    watch('input/*.js', copyTask);
}
exports.default = series(copyTask);
```

## 1.2. 常用插件

### 1.2.1. gulp-sass

把`scss`文件打包成`css`文件。

**安装：**

```shell
pnpm add -D sass gulp-sass 
```

**使用：**

```JavaScript
const sass = require('gulp-sass')(require('sass'));
//创建打包scss任务
function scssTask() {
    return src('./src/*.scss').
        pipe(sass()).
        pipe(dest('./output/'))
}
```

### 1.2.2. gulp-uglifycss

给`css`压缩。

**安装：**

```shell
pnpm add -D gulp-uglifycss
```

**使用：**

```JavaScript
const uglifycss = require('gulp-uglifycss');
//创建打包scss任务
function cssTask() {
    return src('./src/*.css').
        pipe(uglifycss()).
        pipe(dest('./output/'))
}
```

### 1.2.3. gulp-autoprefixer@8.0.0

> 由于高版本无法正常用`require`导入。

**安装：**

```shell
pnpm add -D  gulp-autoprefixer@8.0.0
```

**使用：**

```JavaScript
const autoPrefixer = require('gulp-autoprefixer');
//配置浏览器参数："last 3 version", "safari 5", "ie 8", "ie 9"
function cssTask() {
    return src('./src/*.css').
        pipe(autoPrefixer("last 3 version", "safari 5", "ie 8", "ie 9")).
        pipe(dest('./output/'))
}
```

### 1.2.4. gulp-htmlmin，gulp-clean-css，gulp-file-include

**安装：**

```shell
pnpm add -D  gulp-htmlmin
pnpm add -D  gulp-clean-css
pnpm add -D  gulp-file-include
```

**使用：**

> 详细参数：<https://www.npmjs.com/package/html-minifier>

| 参数                    | 类型                          | 说明                                                                          |
| ----------------------- | ----------------------------- | ----------------------------------------------------------------------------- |
| `collapseWhitespace`    | `Boolean`                     | `html`压缩成一行                                                              |
| `minifyJS`              | `Boolean`,`Object`,`Function` | 压缩`html`中的`script`,可以用`UglifyJS`插件配置打包`js`,默认只能压缩`ES5`语法 |
| `minifyCSS`             | `Boolean`,`Object`,`Function` | 压缩`html`中的`style`,可以用`cleanCSS`插件配置打包`css`                       |
| `removeComments`        | `Boolean`                     | 删除`html`中的所有注释                                                        |
| `trimCustomFragments`   | `Boolean`                     | 修剪周围空格                                                                  |
| `ignoreCustomFragments` | `arry[]`                      | 允许在匹配时忽略某些片段的正则表达式数组（例如`<?php ... ?>`、`{{ ... }}`等） |

#### 1.2.4.1. gulp-file-include

定义公共模板引入

| 参数       | 类型     | 说明                                                                                                                        |
| ---------- | -------- | --------------------------------------------------------------------------------------------------------------------------- |
| `prefix`   | `string` | 定义匹配语法：`@@include('./component/footer.html')`                                                                        |
| `basepath` | `string` | `@file`：相对文件路径匹配模板。`@root`：包含相对于 `gulp` 运行目录的文件。`path/to/dir`：包含相对于您提供的基本路径的文件。 |

> 模板传递参数以及更详细参数配置：<https://www.npmjs.com/package/gulp-file-include>

```JavaScript
const htmlmin = require('gulp-htmlmin');
const cleanCSS = require('gulp-clean-css');
const fileinclude = require('gulp-file-include'); 
function htmlTask() {
    return src('./src/*.html')
    .pipe(
        fileinclude({
            prefix: '@@',
            basepath: '@file',
        })
    )
    .pipe(htmlmin({
                    collapseWhitespace: true, //html压缩成一行
                    minifyJS: true, //压缩内嵌js无法压缩ES6语法
                    minifyCSS: cleanCSS({ compatibility: 'ie8' }), //压缩html中的css
                    removeComments: true, //删除html中的注释
                    removeEmptyAttributes: true, //删除包空的节点属性
                    trimCustomFragments: true, //修剪周围空格
                    ignoreCustomFragments: [/\{\{(.+?)\}\}/g], //允许在匹配时忽略某些片段的正则表达式数组（例如<?php ... ?>、{{ ... }}等）
                })).
        pipe(dest('./output/'))
}
```

### 1.2.5. gulp-uglify，babel，@babel/preset-env

`uglify`负责压缩`ES5`代码`babel`负责把`ES6`代码转换`ES5`。
`@babel/preset-env`：`babel`处理转换预设插件，可以配置兼容浏览器版本。

**安装：**

```shell
pnpm add -D  gulp-uglify
pnpm add -D  babel
pnpm add -D  @babel/preset-env
```

**使用：**

```JavaScript
function jsTask() {
    return src('input/*.js')
        .pipe(
            babel({
                presets: ['@babel/env'],
            })
        )
        .pipe(
            uglify({
                output: {
                    ascii_only: true, //把中文转换成Unicode编码
                },
            })
        )
        .pipe(dest('./output/'));
}
```

### 1.2.6. gulp-webserver

配置一个本地服务器。

**安装：**

```shell
pnpm add -D  gulp-webserver
```

**使用：**
| 参数         | 类型      | 说明                 |
| ------------ | --------- | -------------------- |
| `livereload` | `Boolean` | 文件修改自动刷新     |
| `host`       | `string`  | 配置域名             |
| `port`       | `nubmer`  | 配置端口             |
| `open`       | `string`  | 配置自动打开某个页面 |

```JavaScript
const webserver = require('gulp-webserver');
function server() {
    return src('/').pipe(
        webserver({
            livereload: true, //文件修改自动刷新
            host: 'localhost',
            port: 9900,
            open: '/app/view/home/index.html', //要打开的页面，指向打包成功后的文件目录
        })
    );
}

```

### 1.2.7. gulp-npm-dist

**安装：**

```shell
pnpm add -D gulp-npm-dist
```

**使用：**

```JavaScript
const npmDist = require('gulp-npm-dist');
//自动打包依赖
function atuoRelyTask() {
    return src(npmDist(), { base: './node_modules/' }).pipe(
        dest('./output/lib')
    );
}
```

### 1.2.8. gulp-replace，gulp-if，cross-env

- `gulpif`：更具条件执行对应函数或任务。
- `cross-env`：配置环境变量，根据环境变量打包对应任务
- `gulp-replace`：字符串替换插件，可使用正则匹配替换。

**安装：**

```shell
pnpm add -D gulp-replace
pnpm add -D gulp-if
pnpm add -D cross-env
```

**使用：**

修改打包模式下替换路径中的`access`为`/`。

```JavaScript
const replace = require('gulp-replace');
const gulpif = require('gulp-if');
//自动打包依赖
function atuoRelyTask() {
    return src('input/*.html')
            .pipe(
                gulpif(
                    process.env.NODE_ENV === 'production',
                    replace(/\/access\//g, '/')
                )
            )
        .pipe(
        dest('./output/lib')
    );
}
```
