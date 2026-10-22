import fs from 'node:fs';

const BUF_LEN = 32;
export const readLine = (fd: number) => {
    const buffers: Buffer[] = [];
    
    while (true) {
        const buffer = Buffer.alloc(BUF_LEN);
        try {
            const len = fs.readSync(fd, buffer);
            if (len < BUF_LEN) {
                buffers.push(buffer.subarray(0, len));
                break;
            } else buffers.push(buffer);
        } catch(error) {
            if ((error as any).code !== 'EAGAIN')
                throw error;
        }
    }

    return Buffer.concat(buffers);
};