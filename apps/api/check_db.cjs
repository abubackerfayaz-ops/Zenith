const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
p.user.findFirst({ where: { email: 'admin@zenith.com' } }).then(u => {
  if (u) {
    console.log('Found: ' + u.username + ' / role: ' + u.role + ' / has pw: ' + !!u.password);
  } else {
    console.log('User not found');
    p.user.count().then(c => console.log('Total users: ' + c));
  }
  p.$disconnect();
}).catch(e => {
  console.error('Error: ' + e.message);
  p.$disconnect();
});
