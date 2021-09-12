module.exports = {
  branches: ['main'],
  plugins: [
    '@semantic-release/commit-analyzer',
    '@semantic-release/release-notes-generator',
    [
      '@semantic-release/npm',
      {
        npmPublish: false,
      },
    ],
    [
      '@semantic-release/git',
      {
        assets: [],
      },
    ],
    [
      '@semantic-release/github',
      {
        successComment: false,
        failComment: false,
      },
    ],
  ],
};
