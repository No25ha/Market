const fs = require('fs');
const path = require('path');

const targetDir = path.join(__dirname, 'src');

function removeComments(content, ext) {
    if (ext === '.css') {
        return content.replace(/\/\*[\s\S]*?\*\//g, '');
    }

    // Regex that avoids matching inside strings
    // This is a simplified version but handles common cases
    return content.replace(/\/\*[\s\S]*?\*\/|(\/\/[^"'\n]*)|("(\\.|[^"\\\n])*")|('(\\.|[^'\\\n])*')|(`(\\.|[^`\\\\])*`)/g, (match, group1) => {
        if (group1) return ''; // If it's a // comment, remove it
        if (match.startsWith('/*')) return ''; // If it's a /* */ comment, remove it
        return match; // Otherwise it's a string, keep it
    });
}

function processDirectory(dir) {
    const files = fs.readdirSync(dir);

    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            processDirectory(filePath);
        } else {
            const ext = path.extname(file);
            if (['.ts', '.tsx', '.js', '.jsx', '.css'].includes(ext)) {
                const content = fs.readFileSync(filePath, 'utf8');
                const cleaned = removeComments(content, ext);
                if (content !== cleaned) {
                    fs.writeFileSync(filePath, cleaned, 'utf8');
                    console.log(`Cleaned: ${filePath}`);
                }
            }
        }
    });
}

console.log('Starting comment removal...');
processDirectory(targetDir);
console.log('Finished!');
