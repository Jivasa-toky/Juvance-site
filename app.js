import dotenv from 'dotenv';
dotenv.config();

console.log(process.env.PORT);      // 3000
console.log(process.env.DB_HOST);   // localhost

import { styleText } from 'node:util';
console.log(
  styleText(['red'], 'This is red text ') +
    styleText(['green', 'bold'], 'and this is green bold text ') +
    'this is normal text'
);

