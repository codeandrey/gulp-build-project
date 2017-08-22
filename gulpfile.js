'use strict';
var gulp           = require('gulp'),
		gutil          = require('gulp-util' ),
		sass           = require('gulp-sass'),
		browserSync    = require('browser-sync'),
		spritesmith = require('gulp.spritesmith'),
		concat         = require('gulp-concat'),
		uglify         = require('gulp-uglify'),
		cleanCSS       = require('gulp-clean-css'),
		rename         = require('gulp-rename'),
		pug         = require('gulp-pug'),
		del            = require('del'),
		imagemin       = require('gulp-imagemin'),
		cache          = require('gulp-cache'),
		autoprefixer   = require('gulp-autoprefixer'),
		ftp            = require('vinyl-ftp'),
		notify         = require("gulp-notify"),
		plumber = require('gulp-plumber'),
		svgstore = require('gulp-svgstore'),
		svgmin = require('gulp-svgmin'),
		inject = require('gulp-inject'),
		path = require('path'),
		gcmq = require('gulp-group-css-media-queries');

/* ________     Smart-Grid             _______*/

var smartgrid = require('smart-grid');
/* It's principal settings in smart grid project */
var settings = {
    outputStyle: 'sass', /* less || scss || sass || styl */
    filename: '_smart-grid',
    columns: 12, /* number of grid columns */
    offset: '30px', /* gutter width px || % */
    container: {
        maxWidth: '1200px', /* max-width оn very large screen */
        fields: '30px' /* side fields */
    },
    breakPoints: {
        lg: {
            width: '1100px', /* -> @media (max-width: 1100px) */
            fields: '30px' /* side fields */
        },
        md: {
            width: '960px',
            fields: '15px'
        },
        sm: {
            width: '780px',
            fields: '15px'
        },
        xs: {
            width: '560px',
            fields: '15px'
        }
        /* 
        We can create any quantity of break points.
        some_name: {
            some_width: 'Npx',
            some_offset: 'N(px|%)'
        }
        */
    }
};
 
gulp.task('smartgrid', function() {
	smartgrid('src/sass', settings);
});

/*_________     Pug Build Html Files (Jade)      ________*/

gulp.task('pages', function() {
        gulp.src('src/**/*.pug')
            .pipe(plumber()) 
            .pipe(pug({pretty: true}))
            .pipe(gulp.dest('app'));

});

/*__________        Build CSS Files              _________*/


gulp.task('sass', function() {
	gulp.src('src/sass/*.sass')
              .pipe(plumber()) 
	.pipe(sass().on('error', sass.logError))
	.pipe(gulp.dest('app/css'))
	.pipe(browserSync.reload({stream: true}));
});

/*________        Concatenate Js Files            __________*/

gulp.task('scripts', function() {
     return gulp.src('src/js/*.js')
          .pipe(plumber()) 
	.pipe(concat('scripts.min.js'))
	.pipe(uglify())
	.pipe(gulp.dest('app/js'))
	.pipe(browserSync.reload({stream: true}));
});

/*________     Build Sprite File        _______*/

gulp.task('sprite', function() {
   var spriteData = gulp.src('src/images_sprite/*.png') // путь, откуда берем картинки для спрайта
          .pipe(spritesmith({
                algorithm: 'top-down',        //алгоритм створення спрайта top-down left-right  diagonal    alt-diagonal    binary-tree
                padding: 10,                        //отступ між картинками в спрайті
                imgName: 'sprite.png',
                cssName: 'sprite.css',
          }));
          
    spriteData.img.pipe(gulp.dest('src/img/')); // путь, куда сохраняем картинку
    spriteData.css.pipe(gulp.dest('app/css/')); // путь, куда сохраняем стили  
});

/*________      Minimized images            __________*/

gulp.task('imagemin', function() {
      return gulp.src('src/img/**/*')
	.pipe(cache(imagemin()))
	.pipe(gulp.dest('app/img')); 
});

/*_________     Build SVG Sprite File         _________*/

gulp.task('svgstore', function () {
      return gulp
          .src('src/svg/*.svg')
          .pipe(svgmin(function (file) {
          		var prefix = path.basename(file.relative, path.extname(file.relative));
	          return {
	                plugins: [{
	                    cleanupIDs: {
	                        prefix: prefix + '-',
	                        minify: true
	                    }
	                }]
	          }
        	}))
        .pipe(svgstore())
        .pipe(gulp.dest('app/svg'));
});

/*________     Static Copy Files to app folders     ____________*/

gulp.task('fonts', function() {
    gulp.src('src/fonts/*')
        .pipe(gulp.dest('app/fonts/'))
});

gulp.task('css', function() {
    gulp.src('src/css/*')
        .pipe(gulp.dest('app/css/'))
});

gulp.task('libs', function() {
    gulp.src('src/libs/*')
        .pipe(gulp.dest('app/libs/'))
});

gulp.task('picxel', function() {
    gulp.src('src/picxel_layout/*')
        .pipe(gulp.dest('app/picxel_layout/'))
});

/*________    Starting  Browser Sync Server        _______*/

gulp.task('browser-sync', function() {
	browserSync({
		server: {
			baseDir: 'app'
		},
		notify: false
	});
});

/*__________         Watcher Files         __________*/


gulp.task('watch', function() {
	gulp.watch(['src/sass/*.sass'], function(event, cb) {
        		gulp.start('sass', browserSync.reload);
    	});
	gulp.watch(['src/js/*.js'],  function(event, cb) {
		gulp.start('scripts');
	});
	gulp.watch(['src/**/*.pug','src/index.pug' ], function(event, cb) {
		gulp.start('pages');
	});
	//watch('app/*.html').on('change', browserSync.reload);
});

/*_______    Production  Project Build      ________*/

gulp.task('build', ['deletedist', 'imagemin', 'sass', 'scripts' ], function() {

	var buildFiles = gulp.src([
		'app/*.html',
		'app/.htaccess'
	]).pipe(gulp.dest('dist'));

	var buildCss = gulp.src([
		'app/css/*',
	]).pipe(gulp.dest('dist/css'));

	var buildJs = gulp.src([
		'app/js/scripts.min.js'
	]).pipe(gulp.dest('dist/js'));

	var buildFonts = gulp.src([
		'app/fonts/**/*'
	]).pipe(gulp.dest('dist/fonts'));
	
	var buildFonts = gulp.src([
		'app/libs/**/*'
	]).pipe(gulp.dest('dist/libs'));
	
	var buildImage = gulp.src([
		'app/img/**/*'
	]).pipe(gulp.dest('dist/img'));

});

/*____________Load Project to FTP_________*/

gulp.task('toftp', function() {
	var conn = ftp.create({
		host:      '88.88.88.88',
		user:      '*******',
		password:  '********',
	//	port: '21', 
		parallel:  3,
		log: gutil.log
	});
	var globs = [
		'dist/**',
		'dist/.htaccess',
	];
	return gulp.src(globs, {buffer: false})
	.pipe(conn.dest('/public_html/folders/'));

});

/*___________       Delete all foldres app, dist          ________*/

gulp.task('deleteall', function() { return del.sync('app', 'dist'); });

/*___________       Delete all foldre  dist          ________*/

gulp.task('deletedist', function() { return del.sync('dist'); });

/*___________       Clear Cache files          ________*/

gulp.task('clearcache', function () { return cache.clearAll(); });


/*__________    Default Task Gulp     ___________*/

gulp.task('default', [ 'smartgrid', 'pages', 'sass', 'scripts', 'imagemin', 'libs', 'picxel', 'css', 'fonts', 'watch', 'browser-sync']);
