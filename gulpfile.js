var autoprefixer = require("gulp-autoprefixer");
var browserify   = require("browserify");
var browsersync  = require("browser-sync");
var buffer       = require("vinyl-buffer");
var chalk        = require("chalk");
var chmod        = require("gulp-chmod");
var gulp         = require("gulp");
var gulpif       = require("gulp-if");
var jslint       = require("gulp-jslint");
var less         = require("gulp-less");
var log          = require("gulp-util").log;
var merge        = require("merge-stream");
var minifycss    = require("gulp-minify-css");
var rename       = require("gulp-rename");
var source       = require("vinyl-source-stream");
var uglify       = require("gulp-uglify");
var watch        = require("gulp-watch");
var watchify     = require("watchify");

var error = function(error) {
  log(chalk.red(error.message));
  this.emit("end");
};

var bundle = function(options) {
  var runWatchify = options ? options.watchify : false;

  var streams = [
    { path: "./src/app.js",    dest: "./public/", name: "app.js",    key: "app" },
    { path: "./src/iframe.js", dest: "./public/", name: "iframe.js", key: "iframe" }
  ].map(function(file) {
    var bundler;

    if (runWatchify) {
      bundler = watchify(browserify(file.path, watchify.args));
    }
    else {
      bundler = browserify(file.path);
    }

    bundler.on("log", function(data) {
      var logString = data.split(" ").map(function(word) {
        word = word.replace(/\(|\)/g, "");
        return !isNaN(word) ? chalk.magenta(word) : word;
      }).join(" ");

      log(chalk.cyan("browserify " + file.key) + " " + logString);
    });

    var rebundle = function() {
      if (process.env.NODE_ENV === "production") {
        log(chalk.cyan("browserify") + " running with uglify");
      }

      return bundler
        .bundle()
        .on("error", error)
        .pipe(source(file.name))
        .pipe(gulpif(process.env.NODE_ENV === "production", buffer()))
        .pipe(gulpif(process.env.NODE_ENV === "production", uglify()))
        .pipe(chmod(644))
        .pipe(gulp.dest(file.dest));
    };

    if (runWatchify) {
      bundler.on("update", rebundle);
    }

    return rebundle();
  });

  return merge(streams);
};

var compile = function() {
  var lesser   = less({ paths: [ __dirname + "/node_modules" ] }).on("error", error);
  var filePath = "./less/style.less";
  var fileDest = "./public/";

  return gulp.src(filePath)
    .pipe(lesser)
    .pipe(autoprefixer({ browsers: [ "last 2 versions" ], cascade: false, remove: true }))
    .pipe(minifycss())
    .pipe(gulp.dest(fileDest));
};

var lint = function() {
  return gulp.src([ "*.js", "./src/**/*.js", "!./public/*" ])
    .pipe(jslint({
      errorsOnly: true,
      newcap:     true,
      node:       true,
      nomen:      true,
      regexp:     true,
      sloppy:     true,
      todo:       true,
      vars:       true,
      white:      true
    }))
    .on("error", error);
};

var server = function() {
  return browsersync.init({
    server: { baseDir: "./public/" },
    files:  [ "./public/*" ],
    port:   3000,
    minify: false,
    open:   false,
    ui:     false
  });
};

var copy = function() {
  return gulp.src("./data/*").pipe(gulp.dest("./public/data/"));
};

gulp.task("browserify", function() { return bundle();                   });
gulp.task("watchify",   function() { return bundle({ watchify: true }); });
gulp.task("less",       function() { return compile();                  });
gulp.task("lint",       function() { return lint();                     });
gulp.task("server",     function() { return server();                   });
gulp.task("copy",       function() { return copy();                     });

gulp.task("watch", function() {
  watch("./src/**/*.js", function() { return gulp.start("lint"); });
  watch("./less/*.less", function() { return gulp.start("less"); });
});

gulp.task("default", [ "copy", "lint", "less", "watchify", "watch", "server" ]);
gulp.task("dist",    [ "copy", "browserify", "less" ]);
