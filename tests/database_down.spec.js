const request = require('supertest');
const app = require('../src/app.js');

jest.setTimeout(20 * 10000);

jest.mock('pg', () => {
  const mPool = {
    connect: jest.fn(),
    query: jest.fn().mockImplementation((sql, positionalParams) => {
      if (sql === 'SELECT 1;') return { rowCount: 0 };
      if (positionalParams && positionalParams[0] === '8e236ed7-ef53-4238-b0a4-54c5f4292edf')
        return { rows: [] };
      const rows = [
        {
          id: '8e236ed7-ef53-4238-b0a4-54c5f4293edf',
          title: 'You dont know javascript',
          author: 'bob',
          description: 'Javascript book',
        },
      ];
      return { rows };
    }),
    end: jest.fn(),
  };
  return { Pool: jest.fn(() => mPool) };
});

describe('Even database is down, We can', () => {
  it('add a book', function (done) {
    const book = {
      title: 'You dont know javascript',
      author: 'bob',
      description: 'Javascript book',
    };
    request(app)
      .post('/books')
      .set('Content-Type', 'application/json')
      .send(book)
      .expect(201)
      .end(function (err, res) {
        if (err) return done(err);
        done();
      });
  });

  it('make sure that title is required when adding a book', function (done) {
    const book = {
      author: 'bob',
      description: 'Javascript book',
    };
    request(app)
      .post('/books')
      .set('Content-Type', 'application/json')
      .send(book)
      .expect(400, { statusCode: 400, message: 'title is required parameter' })
      .end(function (err, res) {
        if (err) return done(err);
        done();
      });
  });

  it('make sure that author is required when adding a book', function (done) {
    const book = {
      title: 'You dont know javascript',
      author: '',
      description: 'Javascript book',
    };
    request(app)
      .post('/books')
      .set('Content-Type', 'application/json')
      .send(book)
      .expect(400, {
        statusCode: 400,
        message: 'author is required parameter',
      })
      .end(function (err, res) {
        if (err) return done(err);
        done();
      });
  });

  let bookId;
  it('get list of books', function (done) {
    request(app)
      .get('/books')
      .set('Content-Type', 'application/json')
      .send()
      .expect(200)
      .end(function (err, res) {
        if (err) return done(err);
        expect(JSON.parse(res.text).length).toBeGreaterThan(0);
        bookId = JSON.parse(res.text)[0].id;
        done();
      });
  });

  it('get a book', function (done) {
    request(app)
      .get(`/books/${bookId}`)
      .set('Content-Type', 'application/json')
      .send()
      .expect(200, {
        id: `${bookId}`,
        title: 'You dont know javascript',
        author: 'bob',
        description: 'Javascript book',
      })
      .end(function (err, res) {
        if (err) return done(err);
        done();
      });
  });

  it('wrong book id!', function (done) {
    request(app)
      .get('/books/8e236ed7-ef53-4237-b0a4-54c5f4292edf')
      .set('Content-Type', 'application/json')
      .send()
      .expect(404, {
        statusCode: 404,
        message: 'book with id: 8e236ed7-ef53-4237-b0a4-54c5f4292edf not found',
      })
      .end(function (err, res) {
        if (err) return done(err);
        done();
      });
  });
});
