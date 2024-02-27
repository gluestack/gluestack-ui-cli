import * as fs from 'fs';
import * as path from 'path';

interface PackageMap {
  [key: string]: string[];
}

function parseImports(fileContent: string): string[] {
  const imports: string[] = [];
  const importRegex = /(?:import\s*(?:{[\w\s,]*})?\s*from\s*)['"]([^'"]+)['"]/g;
  let match;
  while ((match = importRegex.exec(fileContent)) !== null) {
    imports.push(match[1]);
  }
  return imports;
}

function processIndexFile(directoryPath: string, packageList: string[]) {
  const indexPath = path.join(directoryPath, 'index.tsx');
  if (fs.existsSync(indexPath)) {
    const fileContent = fs.readFileSync(indexPath, 'utf-8');
    const imports = parseImports(fileContent);
    imports.forEach((pkg) => {
      if (!packageList.includes(pkg)) {
        packageList.push(pkg);
      }
    });
  }
}

function exploreDirectories(directoryPath: string, packageList: string[]) {
  fs.readdirSync(directoryPath).forEach((item) => {
    const itemPath = path.join(directoryPath, item);
    if (fs.statSync(itemPath).isDirectory()) {
      processIndexFile(itemPath, packageList);
    }
  });
}

function createConfig(directoryPath: string, outputPath: string) {
  const packageList: string[] = [];
  exploreDirectories(directoryPath, packageList);
  // Sort and remove duplicates from the package list
  const uniquePackages = Array.from(new Set(packageList)).sort();
  fs.writeFileSync(outputPath, JSON.stringify(uniquePackages, null, 2));
}

export { createConfig };
