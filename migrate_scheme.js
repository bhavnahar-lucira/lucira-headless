const fs = require('fs');
const path = require('path');

const dirs = [
  'src/app/(frontend)/scheme',
  'src/app/(protected)/dashboard/scheme',
  'src/components/scheme',
  'src/app/api/scheme',
  'src/lib/scheme',
  'src/redux/features/scheme'
];

function getAllFiles(dirPath, arrayOfFiles) {
  const files = fs.readdirSync(dirPath);

  arrayOfFiles = arrayOfFiles || [];

  files.forEach(function(file) {
    if (fs.statSync(dirPath + "/" + file).isDirectory()) {
      arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
    } else {
      arrayOfFiles.push(path.join(dirPath, "/", file));
    }
  });

  return arrayOfFiles;
}

let allFiles = [];
dirs.forEach(dir => {
  if (fs.existsSync(dir)) {
    allFiles = getAllFiles(dir, allFiles);
  }
});

console.log(`Processing ${allFiles.length} files...`);

allFiles.forEach(filePath => {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // 1. Replace domain
  content = content.replace(/lucira\.live\.ornaverse\.in/g, 'lucira.uat.ornaverse.in');

  // 2. Replace /api/ with /api/scheme/ (avoid double replace)
  // We use a negative lookahead to avoid replacing if it's already /api/scheme/
  content = content.replace(/\/api\/(?!scheme\/)/g, '/api/scheme/');

  // 3. Update imports
  // Order matters here to avoid overlapping replacements if not careful
  
  // @/components/ui stays same, so we don't touch it.
  // @/components/ -> @/components/scheme/
  // But we must NOT change @/components/ui/
  content = content.replace(/@\/components\/(?!ui\/|scheme\/)/g, '@/components/scheme/');

  // @/lib/mongodb stays same
  // @/lib/ -> @/lib/scheme/
  content = content.replace(/@\/lib\/(?!mongodb|scheme\/)/g, '@/lib/scheme/');

  // @/redux/slices/ -> @/redux/features/scheme/
  content = content.replace(/@\/redux\/slices\//g, '@/redux/features/scheme/');

  // @/assets/ -> /assets/scheme/
  content = content.replace(/@\/assets\//g, '/assets/scheme/');

  // 4. Axios to Fetch (Very basic implementation, might need manual touch for complex ones)
  // This is a rough heuristic.
  if (content.includes('import axios from "axios"') || content.includes("import axios from 'axios'")) {
      // Handle simple axios.post
      // import axios from "axios"; -> (removed)
      // import qs from "qs"; -> (removed)
      content = content.replace(/import axios from ["']axios["'];?\n?/g, '');
      content = content.replace(/import qs from ["']qs["'];?\n?/g, '');

      // axios.post(url, data, { headers: ... }) -> fetch(url, { method: 'POST', body: JSON.stringify(data), headers: ... })
      // This is hard with regex for all cases. 
      // I'll try to handle the ones I saw.
  }

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated: ${filePath}`);
  }
});
