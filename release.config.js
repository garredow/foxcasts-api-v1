module.exports = {
  branches: ['main', 'deploy'],
  plugins: [
    '@semantic-release/commit-analyzer',
    '@semantic-release/release-notes-generator',
    '@semantic-release/changelog',
    [
      '@semantic-release/npm',
      {
        npmPublish: false,
      },
    ],
    [
      '@semantic-release/exec',
      {
        // prepareCmd:
        //   'echo ${lastRelease.version} > old_version && echo ${nextRelease.version} > new_version',
        verifyConditions:
          'echo 1.4.1 > old_version && echo 1.5.1 > new_version',
      },
    ],
    [
      '@semantic-release/github',
      {
        successComment: false,
        failComment: false,
      },
    ],
    '@semantic-release/git',
  ],
};
