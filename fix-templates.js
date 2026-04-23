const fs = require('fs');
const path = require('path');

function walkDir(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach((file) => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat && stat.isDirectory()) {
            results = results.concat(walkDir(filePath));
        } else {
            if (filePath.endsWith('.vue')) {
                results.push(filePath);
            }
        }
    });
    return results;
}

const vueDir = path.join(__dirname, 'client', 'app');
const vueFiles = walkDir(vueDir);

let fixed = 0;
for (const file of vueFiles) {
    let content = fs.readFileSync(file, 'utf-8');
    const hasClosingTemplate = content.includes('</template>');
    const firstLine = content.split('\n')[0].trim();
    if (hasClosingTemplate && !firstLine.startsWith('<template')) {
        content = '<template>\n' + content;
        fs.writeFileSync(file, content, 'utf-8');
        console.log(`Fixed: ${file}`);
        fixed++;
    }
}
console.log(`Total fixed: ${fixed}`);
