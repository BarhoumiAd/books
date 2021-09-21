const { httpError } = require('../util/error');
const { redis } = require('../services/cache');
const { v4: uuidv4 } = require('uuid');
const { createSystemContext } = require('../util/context');
const { config } = require('../util/config');
const SYNCUP_NEEDED = config.SYNCUP_NEEDED;
const SYNCUP_PERIODE = config.SYNCUP_PERIODE;
const INSERT_QUERY =
  'INSERT INTO demo.book(id, title, author, description) values ($1, $2, $3, $4)';
const GET_QUERY = 'SELECT * FROM demo.book {WHERE_CLAUSE}';

class DatabaseMgr {
  constructor() {
    this.init();
  }

  init() {
    setTimeout(async function () {
      await synchronizePgRedis(createSystemContext());
    }, SYNCUP_PERIODE);
  }

  async pgHealthy(context) {
    let healthy = true;
    try {
      const health = await context.sql().query(`SELECT 1;`);
      healthy = health.rowCount === 1;
    } catch (error) {
      healthy = false;
    } finally {
      // eslint-disable-next-line no-unsafe-finally
      return healthy;
    }
  }

  async persist(context) {
    const id = uuidv4();
    const { title, author, description } = context.req.body;
    if (!title || title.trim() === '') throw httpError(400, `title is required parameter`);
    if (!author || author.trim() === '') throw httpError(400, `author is required parameter`);

    if (await this.pgHealthy(context)) {
      await context.sql().query(INSERT_QUERY, [id, title, author, description]);
      await redis.put(context, id, { id, title, author, description });
    } else {
      await redis.put(context, SYNCUP_NEEDED + id, { id, title, author, description });
      context.logger().warn(`Postgres is not healthy, Only Writing to redis ...`);
    }
  }

  async get(context) {
    if (await this.pgHealthy(context)) {
      const positionalParams = [];
      let query = '';
      if (context.req.params.id) {
        query = GET_QUERY.split('{WHERE_CLAUSE}').join(`WHERE id = $1`);
        positionalParams.push(context.req.params.id);
      } else query = GET_QUERY.split('{WHERE_CLAUSE}').join('');
      const result = await context.sql().query(query, positionalParams);
      if (result.rows.length === 0 && !(await redis.syncStatus()))
        return await this.getFromCache(context);
      return result.rows;
    } else {
      return this.getFromCache(context);
    }
  }

  async bulkPersist(context, data) {
    const keysToExpires = [];
    // TODO Function to improve, use bulk insert to insert all records at once
    if (await this.pgHealthy(context)) {
      for (const record of data) {
        await context
          .sql()
          .query(INSERT_QUERY, [record.id, record.title, record.author, record.description]);
        await redis.put(context, record.id, {
          id: record.id,
          title: record.title,
          author: record.author,
          description: record.description,
        });
        keysToExpires.push(`${SYNCUP_NEEDED}${record.id}`);
      }
      await redis.expireKeys(keysToExpires);
    }
  }

  async getFromCache(context) {
    context.logger().warn(`Postgres is not healthy, reading from redis.`);
    const id = context.req.params.id;
    let result;
    if (id) {
      result = await redis.get(id);
      // if the key does not exist then most probably, it is a key that is not synced up yet to postgres
      if (!result) result = await redis.get(`${SYNCUP_NEEDED}${id}`);
    } else {
      result = await redis.getAll('*');
    }
    return result;
  }
}

if (!global.databaseMgr) {
  global.databaseMgr = new DatabaseMgr();
}

async function synchronizePgRedis(context) {
  context.logger().debug(`Syncing up redis to postgres`);
  const data = await redis.getUnsyncedData();
  if (data && data.length > 0) await global.databaseMgr.bulkPersist(context, data);
  setTimeout(async function () {
    await synchronizePgRedis(context);
  }, SYNCUP_PERIODE);
}

module.exports = { databaseMgr: global.databaseMgr };
