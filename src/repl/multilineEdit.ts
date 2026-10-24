import { emitKeypressEvents } from 'node:readline';

type Keypress = {
    sequence: string;
    name: string;
    ctrl: boolean;
    meta: boolean;
    shift: boolean;
};


export const get = (): Promise<string> => {
    return new Promise((resolve) => {
        emitKeypressEvents(process.stdin);
        process.stdin.setRawMode(true);
        process.stdin.resume();
        process.stdin.setEncoding('utf-8');

        let cursorLine = 0;
        let cursorCol = 0;
        const lines: string[] = [ '' ];
        
        const printString = () => {
            process.stdout.write('\x1b[u'); // restore cursor
            process.stdout.write('\x1b[J'); // clear everything below the cursor

            lines.forEach((l, i) => {
                const prefix = i === 0 ? '>>>' : '...';
                process.stdout.write(`${prefix} ${l}\r\n`);
            });

            // reposition the cursor
            const rowsBack = lines.length - cursorLine;
            if (rowsBack > 0) process.stdout.write(`\x1b[${rowsBack}A`);
            process.stdout.write(`\x1b[${cursorCol + 5}G`);
        };

        const onKeypress = (char: string, info: Keypress) => {
            if (!info) return;

            switch (info.name) {
                case 'up':
                    if (cursorLine > 0) {
                        cursorLine--;
                        cursorCol = Math.min(cursorCol, lines[ cursorLine ].length);
                    }
                    break;
                case 'down':
                    if (cursorLine < lines.length - 1) {
                        cursorLine++;
                        cursorCol = Math.min(cursorCol, lines[ cursorLine ].length);
                    }
                    break;
                case 'left':
                    if (cursorCol > 0) cursorCol--;
                    break;
                case 'right':
                    if (cursorCol < lines[ cursorLine ].length) cursorCol++;
                    break;

                case 'backspace':
                    if (cursorCol > 0) {
                        lines[ cursorLine ] =
                            lines[ cursorLine ].slice(0, cursorCol - 1) +
                            lines[ cursorLine ].slice(cursorCol);
                        cursorCol--;
                    }
                    break;

                case 'return':
                    const tail = lines[ cursorLine ].slice(cursorCol);
                    lines[ cursorLine ] = lines[ cursorLine ].slice(0, cursorCol);
                    lines.splice(cursorLine + 1, 0, tail);
                    cursorLine++;
                    cursorCol = 0;
                    break;

                case 'x':
                    if (info.ctrl) {
                        process.stdin.setRawMode(false);
                        process.stdin.removeListener('keypress', onKeypress);
                        process.stdout.write('\n');
                        return resolve(lines.join('\n'));
                    }
                default:
                    if (char && !info.ctrl && !info.meta && char.length === 1) {
                        lines[ cursorLine ] =
                            lines[ cursorLine ].slice(0, cursorCol) +
                            char +
                            lines[ cursorLine ].slice(cursorCol);
                        cursorCol++;
                    }
                    break;
            }

            printString();
        };

        process.stdin.on('keypress', onKeypress);
        process.stdout.write('\x1b[s'); // save the cursor position
        printString();
    });
};