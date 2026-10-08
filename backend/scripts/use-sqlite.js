const fs = require('fs');
const path = require('path');

const src = path.join(__dirname, '../prisma/schema.sqlite.prisma');
const dest = path.join(__dirname, '../prisma/schema.prisma');

// Also keep backup
if (!fs.existsSync(src)) {
  fs.copyFileSync(dest, src);
} else {
  fs.copyFileSync(src, dest);
}
console.log('Switched Prisma schema to SQLite.');
