const fs = require('fs');

// Read the file
const filePath = 'components/AdminDashboard.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Replace € with $
content = content.replace(/€/g, '$');

// Write back
fs.writeFileSync(filePath, content, 'utf8');

console.log('Currency symbol replaced: € -> $');
console.log('Done!');
