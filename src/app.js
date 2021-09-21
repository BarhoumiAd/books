'use strict';
const express = require('express');
const booksRoutes = require('./routes/books');
const app = express();
const { setup } = require('./database/setup');
const { createSystemContext } = require('./util/context');
const { requestResponseLogger } = require('./services/logger');
app.use(requestResponseLogger);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
const context = createSystemContext();
setup(context)
  .then(() => {
    /* do nothing */
  })
  .catch((error) => {
    context.logger().error(error.message);
  });
app.use('/books', booksRoutes);

module.exports = app;
