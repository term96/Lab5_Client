module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    clean: {
      dist: {
        src: ['dist/']
      },
      build: {
        src: ['.build/']
      }
    },
    babel: {
      options: {
        plugins: ['transform-react-jsx'],
        presets: ['es2015', 'react']
      },
      target: {
        files: [{
          expand: true,
          cwd: 'site/scripts/jsx', // Custom folder
          src: ['app.jsx'],
          dest: 'dist/js', // Custom folder
          ext: '.js'
        }]
      }
    },
    concat: {
      css: {
        src: ['site/css/*'],
        dest: 'dist/css/styles.css'
      }
    },
    tslint: {
      options: {
          configuration: "tslint-config.json",
      },
      files: {
          src: ['site/scripts/ts/*.ts']
      }
    },
    ts: {
      target: {
        src: ['site/scripts/ts/main.ts'],
        out: 'dist/js/scripts.js',
        options: {
          noImplicitAny: true,
          removeComments: true,
          preserveConstEnums: true,
          sourceMap: true,
          module: 'system',
          target: 'es5'
        }
      }
    },
    cssmin: {
      target: {
        src: 'dist/css/styles.css',
        dest: 'dist/css/styles.css'
      }
    },
    copy: {
      js: {
        files: [
          {expand: true, cwd: 'dist/js/', src: '*.js', dest: '.build/js'},
          {expand: true, cwd: 'site/scripts/libs/', src: '*.js', dest: '.build/js'},
          {expand: true, cwd: 'site/scripts/systemjs/', src: '*', dest: '.build/js'}
        ]
      },
      css: {
        files: [
          {expand: true, cwd: 'dist/', src: '**/*.css', dest: '.build/'}
        ]
      },
      html: {
        files: [
          {expand: true, cwd: 'site/', src: 'index.html', dest: '.build/'}
        ]
      }
    },
    hashres: {
      options: {
        fileNameFormat: '${name}.${hash}.${ext}',
        renameFiles: true
      },
      css: {
        src: ['.build/css/styles.css'],
        dest: '.build/index.html'
      },
      js: {
        src: ['.build/js/*.js'],
        dest: '.build/index.html'
      }
    },
    connect: {
      server: {
        options: {
          hostname: 'localhost',
          port: 8080,
          base: '.build',
          open: true,
          livereload: true
        }
      }
    },
    watch: {
      options: {
        livereload: true
      },
      js: {
        files: ['site/scripts/**/*'],
        tasks: ['make-scripts', 'copy-hash']
      },
      css: {
        files: 'site/css/*',
        tasks: ['make-styles', 'copy-hash']
      },
      html: {
        files: 'site/index.html',
        tasks: ['shell:spell_html', 'copy-hash']
      },
      build: {
        files: '.build/**/*'
      }
    },
    shell: {
      spell_scripts: {
        command: 'cspell "site/scripts/**/*"'
      },
      spell_css: {
        command: 'cspell "site/css/*"'
      },
      spell_html: {
        command: 'cspell "site/index.html"'
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-babel');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-hashres');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-ts');
  grunt.loadNpmTasks('grunt-tslint');
  grunt.loadNpmTasks('grunt-shell');
  
  grunt.registerTask('make-scripts', ['shell:spell_scripts', 'tslint', 'ts', 'babel']);
  grunt.registerTask('make-styles', ['shell:spell_css', 'concat:css', 'cssmin']);
  grunt.registerTask('copy-hash', ['clean:build', 'copy', 'hashres']);

  grunt.registerTask('default', ['clean', 'shell:spell_html', 'make-scripts', 'make-styles', 'copy-hash']);
  grunt.registerTask('serve', ['connect', 'watch']);

};