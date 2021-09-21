'use strict';
const { Router } = require('express');
const router = Router();
const { httpContext } = require('../util/context');
const { databaseMgr } = require('../database/dbManager');
const { errorResponse, httpError } = require('../util/error');

// Get books
router.get('/', async (req, res) => {
  const context = httpContext(req, res);
  try {
    const result = await databaseMgr.get(context);
    res.status(200).json(result).end();
  } catch (error) {
    errorResponse(context, '/books', error);
  }
});

router.get('/:id', async (req, res) => {
  const context = httpContext(req, res);
  try {
    const result = await databaseMgr.get(context);
    if (!result || result.length === 0)
      throw httpError(404, `book with id: ${req.params.id} not found`);
    res.status(200).json(result[0]).end();
  } catch (error) {
    errorResponse(context, '/books', error);
  }
});

// Post book
router.post('/', async (req, res) => {
  const context = httpContext(req, res);
  try {
    await databaseMgr.persist(context);
    res.status(201).end();
  } catch (error) {
    errorResponse(context, '/books', error);
  }
});

module.exports = router;
