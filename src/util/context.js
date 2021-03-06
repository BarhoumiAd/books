const { SQL } = require('../database/sql');
const { createLogger } = require('../services/logger');
class Context {
  constructor(args) {
    this.req = args.req;
    this.res = args.res;
    this.systemContext = args.systemContext;
  }

  logger() {
    if (!this.loggerService) this.loggerService = createLogger(this);
    return this.loggerService;
  }

  sql() {
    if (!this.sqlService) this.sqlService = new SQL(this);
    return this.sqlService;
  }
}

function httpContext(req, res) {
  return new Context({ req, res });
}

function createSystemContext() {
  return new Context({ systemContext: true });
}

module.exports = { httpContext, createSystemContext };
