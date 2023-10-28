import fs from 'fs';
import path from 'path';

const list = listDir('public/declare').map((item) => item.replace(/\\/g, '/').replace('public/declare/', ''));
fs.writeFileSync('src/assets/declare.json', JSON.stringify(list, null, 2));

function listDir(dirPath) {
    const list = [];
    const files = fs.readdirSync(dirPath);
    files.forEach((sub) => {
        const subPath = path.join(dirPath, sub);
        const stat = fs.statSync(subPath);
        if (stat.isDirectory()) {
            list.push(...listDir(subPath));
        } else {
            sub.endsWith('.d.ts') && list.push(subPath);
        }
    });
    return list;
}
