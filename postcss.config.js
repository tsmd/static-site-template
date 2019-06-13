module.exports = ctx => {
  return {
    map: {
      inline: ctx.env !== "production",
      sourcesContent: true,
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
