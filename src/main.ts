import fs from 'node:fs';
import { tokenize } from './lexer/lexer.ts';
import { parse } from './parser/parser.ts';

const [ node, main, script, ...args ] = process.argv;

const code = fs.readFileSync(script).toString();


const tokenStream = tokenize(code);
console.log(tokenStream.tokens);
const ast = parse(tokenStream);

console.log(JSON.stringify(ast, null, '    '));