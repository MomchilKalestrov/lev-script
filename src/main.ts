import fs from 'node:fs';
import path from 'node:path';
import { evaluate } from './interpreter/interpreter';

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

if (!fs.existsSync(script)) {
    printUsage();
    process.exit(1);
};

evaluate(path.resolve(script));