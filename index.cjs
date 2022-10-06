#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const cwd = process.cwd();
const os = require('os');

if (process.argv.length !== 4) {
  console.log('Usages: npm create replicache-app -- <projectName> <type>');
  console.log('        npx create-replicache-app <projectName> <type>');
  process.exit(1);
}

const projectName = process.argv[2];
if (!isValidPackageName(projectName)) {
  console.log('Invalid project name');
  process.exit(1);
}
const type = process.argv[3];
const availableClientsFolders = fs
  .readdirSync(path.join(__dirname, 'client'), {
    withFileTypes: true,
  })
  .filter(dirent => dirent.isDirectory());
const availableClientNames = availableClientsFolders.map(dirent => dirent.name);
1
if (!availableClientNames.includes(type)) {
  console.log(`Unknown client type: ${type}`);
  console.log(`Available clients: ${availableClientNames.join(', ')}`);
  process.exit(1);
}

const replicacheQuickstartsDest = path.join(
  cwd,
  projectName,
);

if (fs.existsSync(replicacheQuickstartsDest)) {
  console.log(
    `${replicacheQuickstartsDest} directory already exists. Please delete the folder first if you'd like to recreate.`,
  );
  process.exit(1);
}
// https://docs.npmjs.com/cli/v8/configuring-npm/package-json#name
function isValidPackageName(projectName) {
  return /^(?:@[a-z0-9-*~][a-z0-9-*._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/.test(
    projectName
  )
}

function copyQuickstarts() {
  fs.cpSync(__dirname, replicacheQuickstartsDest, { recursive: true });
  console.log(`Created ${replicacheQuickstartsDest}`);
  const deleteClientsList = availableClientsFolders.filter(
    dirent => dirent.name !== type,
  );

  //clean up quickstarts
  let filesToDelete = [];
  for (const client of deleteClientsList) {
    deleteClient = path.join(replicacheQuickstartsDest, 'client', client.name);
    filesToDelete.push(deleteClient);
  }

  //clean up misc files
  deleteIndex = path.join(replicacheQuickstartsDest, 'index.cjs');
  deletePackageJson = path.join(replicacheQuickstartsDest, 'package.json');
  deleteReadme = path.join(replicacheQuickstartsDest, 'README.md');
  deleteLicense = path.join(replicacheQuickstartsDest, 'LICENSE');
  filesToDelete.push(deleteIndex, deletePackageJson, deleteReadme, deleteLicense);
  // server is not necesary for nextjs
  if (type === 'nextjs') {
    filesToDelete.push(path.join(replicacheQuickstartsDest, 'server'));
  }
  for (const fileToDelete of filesToDelete) {
    fs.rmSync(fileToDelete, {
      recursive: true,
      force: true,
    });
  }


  //write package.json
  const packageJson = {
    name: projectName,
    version: "0.1.0",
    devDependencies: {
      "@rocicorp/eslint-config": "^0.1.2",
      "@rocicorp/prettier-config": "^0.1.1",
      "typescript": "4.7.4"
    },
    scripts: {
      "format": "npm run format --ws",
      "check-format": "npm run check-format --ws",
      "lint": "npm run lint --ws",
      "build": "npm run build -ws --if-present",
      "check-types": "npm run check-types --ws"
    },
    type: "module",
    eslintConfig: {
      "extends": "@rocicorp/eslint-config"
    },
    prettier: "@rocicorp/prettier-config",
    engines: {
      "node": ">=16.15.0",
      "npm": ">=7.0.0"
    },
    workspaces: [
      "client/*",
      "server",
      "shared"
    ]
  }

  fs.writeFileSync(
    path.join(replicacheQuickstartsDest, 'package.json'),
    JSON.stringify(packageJson, null, 2) + os.EOL
  )
}

try {
  copyQuickstarts();
} catch (err) {
  console.error(err);
  process.exit(1);
}
