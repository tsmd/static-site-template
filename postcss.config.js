module.exports = ctx => {
  return {
    map: {
      sourcesContent: false,
      annotation: true
    },
    syntax: "postcss-scss",
    plugins: {
      "@csstools/postcss-sass": {},
      autoprefixer: { grid: true },
      csswring: ctx.env === "production" ? {} : false
    }
  };
};
