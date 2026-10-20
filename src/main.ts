import fs from 'node:fs';
import { tokenize } from './lexer/lexer.ts';
import { parse } from './parser/parser.ts';
import { evaluate } from './interpreter/interpreter.ts';

const [ node, main, script, ...args ] = process.argv;

const printUsage = () => {
    console.log(`Usage: ${ main } [FILE] [OPTION]...`);
    console.log('--dump-ast [FILE]');
    console.log('\tDump the AST to a specified file');
    console.log('-h, --help');
    console.log('\tShows this menu');
}

if (args.includes('-h') || args.includes('--help')) {
    printUsage();
    process.exit(0);
};

let code: string;
try {
    code = fs.readFileSync(script).toString();
} catch {
    printUsage();
    process.exit(1);
};

const tokenStream = tokenize(code);

const ast = parse(tokenStream);
const dumpAstArg = args.indexOf('--dump-ast');
if (args.includes('--dump-ast'))
    fs.writeFileSync(args[ dumpAstArg + 1 ] ?? 'ast.json', JSON.stringify(ast, null, '\t'));

evaluate(ast);