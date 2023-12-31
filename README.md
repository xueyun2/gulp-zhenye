
# 1. Gulp构建前端自动化

- [1. Gulp构建前端自动化](#1-gulp构建前端自动化)
  - [1.1. 环境安装](#11-环境安装)
  - [1.2. 常用API基础用法](#12-常用api基础用法)
  - [1.3. CSS相关插件](#13-css相关插件)
    - [1.3.1. gulp-sass](#131-gulp-sass)
    - [1.3.2. gulp-clean-css](#132-gulp-clean-css)
    - [1.3.3. gulp-autoprefixer@8.0.0](#133-gulp-autoprefixer800)
  - [1.4. HTML相关插件](#14-html相关插件)
    - [1.4.1. gulp-htmlmin，gulp-file-include](#141-gulp-htmlmingulp-file-include)
      - [1.4.1.1. gulp-file-include](#1411-gulp-file-include)
  - [1.5. JavaScript相关插件](#15-javascript相关插件)
    - [1.5.1. gulp-uglify，babel，@babel/preset-env](#151-gulp-uglifybabelbabelpreset-env)
  - [1.6. 本地服务插件](#16-本地服务插件)
    - [1.6.1. gulp-webserver](#161-gulp-webserver)
  - [1.7. 依赖打包插件](#17-依赖打包插件)
    - [1.7.1. gulp-npm-dist](#171-gulp-npm-dist)
  - [1.8. 环境变量插件，其他工具插件](#18-环境变量插件其他工具插件)
    - [1.8.1. gulp-replace，gulp-if，cross-env](#181-gulp-replacegulp-ifcross-env)
      - [1.8.1.1. 配置package.json打包命令和开发命令](#1811-配置packagejson打包命令和开发命令)
  - [1.9. 源映射插件](#19-源映射插件)
    - [1.9.1. gulp-sourcemaps](#191-gulp-sourcemaps)

## 1.1. 环境安装

使用`gulp`构建`PHP`传统项目中的前端代码

> 下载`node`安装: <https://nodejs.org/en>
> 打开命令安装`gulp-cli`环境：`npm install gulp-cli -g`

## 1.2. 常用API基础用法

文档地址：<https://www.gulpjs.com.cn/>

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

## 1.3. CSS相关插件

### 1.3.1. gulp-sass

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

### 1.3.2. gulp-clean-css

给`css`压缩。

**安装：**

```shell
pnpm add -D gulp-clean-css
```

**使用：**

```JavaScript
const cleanCSS = require('gulp-clean-css');
//创建打包scss任务
function cssTask() {
    return src('./src/*.css').
        pipe(cleanCSS()).
        pipe(dest('./output/'))
}
```

### 1.3.3. gulp-autoprefixer@8.0.0

给`css`代码添加浏览器兼容前缀。

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

## 1.4. HTML相关插件

### 1.4.1. gulp-htmlmin，gulp-file-include

压缩`HTML`并对静态代码划分一个个文件组件（公共模板）

- `gulp-htmlmin`：压缩`html`代码。
- `gulp-file-include`：讲静态`html`划分成一个个模板。

**安装：**

```shell
pnpm add -D  gulp-htmlmin
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

#### 1.4.1.1. gulp-file-include

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

## 1.5. JavaScript相关插件

### 1.5.1. gulp-uglify，babel，@babel/preset-env

压缩和转换`JavaScript`代码。

- `gulp-uglify`：压缩`ES5`代码。
- `babel`：负责转换`ES6`或者更高版本`js`为低版本。
- `@babel/preset-env`：基于`babel`的一个预设用于处理js兼容以及浏览器配置。通常和`babel`组合使用。

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

## 1.6. 本地服务插件

### 1.6.1. gulp-webserver

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

## 1.7. 依赖打包插件

### 1.7.1. gulp-npm-dist

打包`node_modules`中的依赖模块到指定目录中。

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

## 1.8. 环境变量插件，其他工具插件

### 1.8.1. gulp-replace，gulp-if，cross-env

- `gulpif`：根具条件执行对应函数或任务。
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

#### 1.8.1.1. 配置package.json打包命令和开发命令

```json
"scripts": {
    "build": "cross-env NODE_ENV=production gulp",
    "dev": "cross-env NODE_ENV=preproduction gulp"
  }
```

**运行命令：**

```shell
pnpm build  # 打包模式
pnpm dev    # 开发模式
```

**在gulpfile.js使用：**

- `production`：打包模式
- `preproduction`：开发者模式

```JavaScript
// env === 'production' || env===preproduction
 const env= process.env.NODE_ENV
```

## 1.9. 源映射插件

### 1.9.1. gulp-sourcemaps

压缩后的代码定位到源文件中的代码位置

**安装：**

```shell
pnpm add -D gulp-sourcemaps
```

**使用：**

```JavaScript
function jsTask() {
    return src('input/*.js')
        .pipe(sourcemaps.init())
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
        .pipe(sourcemaps.write())
        .pipe(dest('./output/'));
}
```
