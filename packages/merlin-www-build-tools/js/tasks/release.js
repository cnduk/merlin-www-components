'use strict';

const fs = require('fs');

const gulp = require('gulp');
const conventionalChangelog = require('gulp-conventional-changelog');
const bump = require('gulp-bump');
const gutil = require('gulp-util');
const git = require('gulp-git');
const runSequence = require('run-sequence');
const minimist = require('minimist');

const utils = require('../utils');


module.exports = function taskReleaseExports(taskConfig, browserSync) {

    const args = minimist(process.argv.slice(2));

    gulp.task('create-changelog', function(done){
        utils.createFileNotExist(taskConfig.release.changelog, done);
    });

    gulp.task('changelog', function() {
        return gulp.src(taskConfig.release.changelog, {
            buffer: false
        })
        .pipe(conventionalChangelog({
            preset: 'angular',
            releaseCount: 0
        }))
        .pipe(gulp.dest('./'));
    });

    gulp.task('bump-version', function() {
        let bumpType = null;
        if (args.patch) {
            bumpType = 'patch';
        } else if (args.minor) {
            bumpType = 'minor';
        } else if (args.major) {
            bumpType = 'major';
        }

        return gulp.src([
            taskConfig.release.package
        ])
        .pipe(bump({
            type: bumpType
        }).on('error', gutil.log))
        .pipe(gulp.dest('./'));
    });

    gulp.task('commit-changes', function() {
        const msg = `chore(Release): v${utils.getPackageJsonVersion(taskConfig.release.package)}`;
        return gulp.src([
            taskConfig.release.package,
            taskConfig.release.changelog
        ])
        .pipe(git.add())
        .pipe(git.commit(msg));
    });

    gulp.task('push-changes', function (cb) {
      git.push('origin', 'master', cb);
    });

    gulp.task('create-new-tag', function(cb) {
        const version = utils.getPackageJsonVersion(taskConfig.release.package);
        git.tag(`v${version}`, `Created Tag for version: ${version}`, function(error) {
            if (error) {
                return cb(error);
            }
            git.push('origin', `v${version}`, cb);
        });
    });


    return function taskRelease(done) {

        // Check we have a version bump
        if (!args.patch && !args.minor && !args.major) {
            console.error('No version bump specified! Quitting release.');
            return done();
        }

        runSequence(
            'create-changelog',
            'bump-version',
            'changelog',
            'commit-changes',
            'push-changes',
            'create-new-tag',
            function(error) {
                if (error) {
                    console.log(error.message);
                }
                done(error);
            }
        );
    };
}