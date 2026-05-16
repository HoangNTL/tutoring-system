const fs = require('fs');
const path = require('path');

const distDirectory = path.resolve(__dirname, '../dist');

const getJavaScriptFiles = (directoryPath) => {
  const directoryEntries = fs.readdirSync(directoryPath, {
    withFileTypes: true,
  });

  return directoryEntries.flatMap((entry) => {
    const entryPath = path.join(directoryPath, entry.name);

    if (entry.isDirectory()) {
      return getJavaScriptFiles(entryPath);
    }

    return entry.name.endsWith('.js') ? [entryPath] : [];
  });
};

const toImportPath = (fromFile, aliasPath) => {
  const targetPath = path.join(distDirectory, aliasPath);
  let relativePath = path.relative(path.dirname(fromFile), targetPath);

  if (!relativePath.startsWith('.')) {
    relativePath = `./${relativePath}`;
  }

  return relativePath.replace(/\\/g, '/');
};

for (const filePath of getJavaScriptFiles(distDirectory)) {
  const fileContents = fs.readFileSync(filePath, 'utf8');

  const updatedContents = fileContents.replace(
    /(['"])@\/([^'"]+)\1/g,
    (_match, quote, aliasPath) => `${quote}${toImportPath(filePath, aliasPath)}${quote}`,
  );

  if (updatedContents !== fileContents) {
    fs.writeFileSync(filePath, updatedContents, 'utf8');
  }
}
