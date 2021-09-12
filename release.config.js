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
        verifyConditionsCmd:
          'echo 1.4.0 > old_version && echo 1.5.0 > new_version ',
        // prepareCmd:
        //   'echo "From ${lastRelease.version}" && echo "From ${nextRelease.version}"',
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
