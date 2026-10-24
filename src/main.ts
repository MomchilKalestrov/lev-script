import fs from 'node:fs';
import path from 'node:path';
import { repl } from './repl/repl';
import { evaluate } from './interpreter/interpreter';

declare global {
    var VERSION: string;
};

global.VERSION = '0.0.1';

const [ , main, ...args ] = process.argv;

(async () => {
    const printUsage = () => {
        console.log(`Usage: ${ path.basename(main) } [FILE] [OPTION]...`);
        console.log('--dump-ast [FILE]');
        console.log('\tDump the AST to a specified file');
        console.log('-h, --help');
        console.log('\tShows this menu');
        console.log('--repl');
        console.log('\tRuns the REPL');
        console.log('-v, --version');
        console.log('\tShows the current version');
    }

    if (args.includes('-v') || args.includes('--version')) {
        console.log(global.VERSION);
        process.exit(0);
    };
    
    if (args.includes('-h') || args.includes('--help')) {
        printUsage();
        process.exit(0);
    };
    
    if (args.includes('--repl')) {
        await repl();
        process.exit(0);
    };
    
    const [ script ] = args.filter(arg => !arg.startsWith('-'));
    
    if (!script || !fs.existsSync(script)) {
        printUsage();
        process.exit(1);
    };
    
    
    evaluate(path.resolve(script));
})();
