module.exports = {
  files: [
    {
      path: ".next/static/chunks/*.js",
      maxSize: "150kb",
    },
    {
      path: ".next/static/css/*.css",
      maxSize: "50kb",
    },
    {
      path: ".next/static/**/*.js",
      maxSize: "500kb",
    },
  ],
  normalize: true,
  ci: {
    trackBranches: ["main", "develop"],
    defaultBranch: "main",
    repoAccessToken: process.env.BUNDLEWATCH_GITHUB_TOKEN,
  },
};
