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
        } else if (filePath.endsWith('.vue')) {
            results.push(filePath);
        }
    });
    return results;
}

const vueFiles = walkDir(path.join(__dirname, 'client', 'app'));
for (const f of vueFiles) {
    let c = fs.readFileSync(f, 'utf8');
    if (c.includes('  </div>\r\n  </div>\r\n</template>') || c.includes('  </div>\n  </div>\n</template>')) {
        console.log('Fixing duplicate div: ' + f);
        c = c.replace('  </div>\r\n  </div>\r\n</template>', '  </div>\r\n</template>')
             .replace('  </div>\n  </div>\n</template>', '  </div>\n</template>');
        fs.writeFileSync(f, c);
    }
}
console.log('Done scanning for duplicate divs.');
