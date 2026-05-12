const fs = require('fs');
const { execSync } = require('child_process');

  const filesToFix = new Set();
  const themeFiles = new Set();
  const alphaFiles = new Set();
  
  // We'll just read all files in src and if they contain alpha(, we add the import if missing
  const glob = require('child_process').execSync('find src -name "*.tsx" -o -name "*.ts"', { encoding: 'utf-8' }).split('\\n').filter(Boolean);

  glob.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    if (content.includes('alpha(') && !content.includes('alpha }')) {
      alphaFiles.add(file);
    }
  });

  alphaFiles.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    if (!content.includes('alpha }') && !content.includes('{ alpha }')) {
      content = `import { alpha } from '@mui/material/styles';\n` + content;
      fs.writeFileSync(file, content);
      console.log(`Fixed alpha in: ${file}`);
    }
  });

