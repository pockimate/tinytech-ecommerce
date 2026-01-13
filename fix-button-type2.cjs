const fs = require('fs');

// Read the file
const filePath = 'components/AdminDashboard.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Replace type="按钮" with type="button"
content = content.replace(/type="按钮"/g, 'type="button"');

// Write back
fs.writeFileSync(filePath, content, 'utf8');

console.log('Fixed all type="按钮" to type="button"');
console.log('Done!');
