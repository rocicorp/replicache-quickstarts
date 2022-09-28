#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const cwd = process.cwd();

if (process.argv.length !== 3) {
  console.log('Usage: npm create replicache-quickstarts -- <type>');
  process.exit(1);
}

const type = process.argv[2];
const availableClientsFolders = fs
  .readdirSync(path.join(__dirname, 'client'), {
    withFileTypes: true,
  })
  .filter(dirent => dirent.isDirectory());
const availableClientNames = availableClientsFolders.map(dirent => dirent.name);

if (!availableClientNames.includes(type)) {
  console.log(`Unknown client type: ${type}`);
  console.log(`Available clients: ${availableClientNames.join(', ')}`);
  process.exit(1);
}

const replicacheQuickstartsDest = path.join(
  cwd,
  `replicache-quickstarts-${type}`,
);

if (fs.existsSync(replicacheQuickstartsDest)) {
  console.log(
    `${replicacheQuickstartsDest} directory already exists. Please delete the folder first if you'd like to recreate.`,
  );
  process.exit(1);
}

function copyQuickstarts() {
  fs.cpSync(__dirname, replicacheQuickstartsDest, {recursive: true});
  console.log(`Created ${replicacheQuickstartsDest}`);
  const deleteClientsList = availableClientsFolders.filter(
    dirent => dirent.name !== type,
  );

  for (const client of deleteClientsList) {
    deletePath = path.join(replicacheQuickstartsDest, 'client', client.name);
    fs.rmSync(deletePath, {
      recursive: true,
      force: true,
    });
  }
}

try {
  copyQuickstarts();
} catch (err) {
  console.error(err);
  process.exit(1);
}
