const indexRouter = require("./index");

exports.routesInit = (app) => {
  app.use("/",indexRouter);
}