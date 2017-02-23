'use strict';

var gulp = require('gulp'),
    browserSync = require("browser-sync"),
    reload = browserSync.reload;



var config = {
    server: {
        baseDir: "./"
    },
    tunnel: false,
    host: 'localhost',
    port: 3000,
    logPrefix: "Developer_Server"
};



gulp.task('webserver', function () {
    browserSync(config);
});





gulp.task('default', ['webserver']);