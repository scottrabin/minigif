module.exports = function(grunt) {
	require("load-grunt-tasks")(grunt);

	grunt.initConfig({
		copy: {
			main: {
				files: [
					{
						src:    'node_modules/react/dist/react.min.js',
						dest:   'dist/js/react.min.js'
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
				entry: './src/js/bg.js',
				output: {
					path: 'dist/js',
					filename: 'bg.js'
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
		clean: ['dist']
	});

	grunt.registerTask('default', ['clean', 'copy', 'sass', 'webpack'])
};
