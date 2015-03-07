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
		babel: {
			options: {
				sourceMap: false
			},
			dist: {
				files: [{
					expand: true,
					cwd:    'src/js',
					src:    '**/*.js',
					dest:   'dist/js/',
					filter: 'isFile'
				}]
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

	grunt.registerTask('default', ['clean', 'copy', 'sass', 'babel'])
};
