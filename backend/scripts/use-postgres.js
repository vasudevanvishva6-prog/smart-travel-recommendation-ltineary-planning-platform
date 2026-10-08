const fs = require('fs');
const path = require('path');

const src = path.join(__dirname, '../prisma/schema.postgresql.prisma');
const dest = path.join(__dirname, '../prisma/schema.prisma');

fs.copyFileSync(src, dest);
console.log('Switched Prisma schema to PostgreSQL.');
