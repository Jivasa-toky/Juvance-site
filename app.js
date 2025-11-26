import { styleText } from 'node:util';
console.log(
  styleText(['red'], 'This is red text ') +
    styleText(['green', 'bold'], 'and this is green bold text ') +
    'this is normal text'
);
