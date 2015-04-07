module.exports = function(grunt) {
	require("load-grunt-tasks")(grunt);

	grunt.initConfig({
		copy: {
			main: {
				files: [
					{
						src:    'node_modules/react/dist/react.min.js',
						dest:   'dist/js/vendor/react.min.js'
					},
					{
						src:    'manifest.json',
						dest:   'dist/manifest.json'
					},
					{
						expand: true,
						cwd:    'src/html',
						src:    '*',
						dest:   'dist/',
						filter: 'isFile'
					}
				]
			}
		},
		webpack: {
			all: {
				entry: {
					"bg":             './src/js/bg.js',
					"manage":         './src/js/manage.js',
					"popup_newimage": './src/js/popup_newimage.js',
					"popup_search":   './src/js/popup_search.js',
					"inpage_search":  './src/js/inpage_search.js'
				},
				output: {
					path: 'dist/js',
					filename: '[name].js'
				},
				module: {
					loaders: [
						{ test: /\.js$/, exclude: /node_modules/, loader: 'babel-loader' }
					]
				}
			}
		},
		sass: {
			options: {
				sourceMap: false
			},
			dist: {
				files: {
					'dist/css/minigif.css': 'src/sass/minigif.scss'
				}
			}
		},
		clean: ['dist'],
		watch: {
			scripts: {
				files: ['src/**/*.js'],
				tasks: ['webpack'],
				options: {
					spawn: false
				}
			},
			stylesheets: {
				files: ['src/**/*.scss'],
				tasks: ['sass'],
				options: {
					spawn: false
				}
			},
			templates: {
				files: ['src/**/*.html'],
				tasks: ['copy'],
				options: {
					spawn: false
				}
			}
		}
	});

	grunt.registerTask('watch:all', ['watch:scripts', 'watch:stylesheets', 'watch:templates']);
	grunt.registerTask('build',     ['copy', 'sass', 'webpack']);
	grunt.registerTask('dev',       ['clean', 'build', 'watch'])
	grunt.registerTask('default',   ['clean', 'build']);
};
