import { task, src, dest, series } from 'gulp';
import plumber from 'gulp-plumber';
import fileInclude from 'gulp-file-include';

const onError = function (err) {
	console.error(err);
	this.emit('end');
};

const paths = {
	html: {
		src: 'src/html/',
		dest: 'build/'
	}
};

task('html', function () {
	return src(paths.html.src + 'dev.html')
		.pipe(plumber({ errorHandler: onError }))
		.pipe(
			fileInclude({
				prefix: '@@',
				basepath: paths.html.src
			})
		)
		.pipe(dest(paths.html.dest));
});

task('default', series('html'));
