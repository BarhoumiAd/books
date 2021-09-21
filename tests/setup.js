process.env.EXPECTED_EXPORTER_VERSION = '2.2.2';

jest.mock('ioredis', (setting) => {
  return function (uname, port, hostname, password) {
    return {
      get: (key) => {
        if (
          [
            '8e236ed7-ef53-4238-b0a4-54c5f4292edf',
            'syncup_needed_8e236ed7-ef53-4238-b0a4-54c5f4292edf',
            '8e236ed7-ef53-4237-b0a4-54c5f4292edf',
            'syncup_needed_8e236ed7-ef53-4237-b0a4-54c5f4292edf',
          ].includes(key)
        )
          return null;
        return '{"id":"9b1f893c-1759-4eec-81b7-7977cda23c10","title":"You dont know javascript","author":"bob","description":"Javascript book"}';
      },
      set: function (key, serialized) {
        return true;
      },
      keys: function (pattern) {
        //  ['syncup_needed_9b1f893c-1759-4eec-81b7-7977cda23c10']

        return ['8e236ed7-ef53-4238-b0a4-54c5f4293edf'];
      },
      disconnect: () => {},
      quit: () => {},
      on: () => {},
      expire: (key, retention) => {},
    };
  };
});

// host: config.pgHost,
//       port: config.pgPort,
//       user: config.pgUser,
//       password: config.pgPassword,
//       database: config.pgDbName,

jest.mock('pg', () => {
  const mPool = {
    connect: jest.fn(),
    query: jest.fn().mockImplementation((sql, positionalParams) => {
      if (sql === 'SELECT 1;') return { rowCount: 1 };
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

// jest.mock('uuid', (setting) => {
//   const v4 = jest.fn().mockImplementation(() => {
//     return 'asdf';
//   });

//   return {
//     v4: v4,
//   };
// });
