const fs = require('fs');
const { execSync } = require('child_process');

try {
  const output = execSync('npx tsc --noEmit --skipLibCheck', { encoding: 'utf-8' });
} catch (e) {
  const output = e.stdout || e.message;
  // Match lines like: src/components/LanguageSelector.tsx:43:53 - error TS2304: Cannot find name 'theme'.
  // and Cannot find name 'alpha'
  
  const filesToFix = new Set();
  const themeFiles = new Set();
  const alphaFiles = new Set();

  const lines = output.split('\n');
  for (const line of lines) {
    if (line.includes('TS2304') && line.includes('Cannot find name')) {
      const match = line.match(/^(src\/.*?\.tsx?):/);
      if (match) {
        const file = match[1];
        if (line.includes("'theme'")) {
          themeFiles.add(file);
        }
        if (line.includes("'alpha'")) {
          alphaFiles.add(file);
        }
      }
    }
  }

  themeFiles.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    
    // Check if useTheme is imported
    if (!content.includes('useTheme')) {
      content = `import { useTheme } from '@mui/material/styles';\n` + content;
    }
    
    // Inject const theme = useTheme(); into the functional component body
    // This is tricky via regex, so we'll log them to check manually or try best-effort.
    // Instead of replacing in function body, since changing `sx={{ color: theme.palette... }}` is easiest:
    // Some are in sx props on root. We can change `theme.palette...` to `(theme) => theme.palette...` if it's strictly in `sx` !
    console.log(`Needs theme: ${file}`);
  });

  alphaFiles.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    if (!content.includes('alpha')) {
      if (content.match(/import\s+{.*}\s+from\s+['"]@mui\/material\/styles['"]/)) {
        content = content.replace(/import\s+{(.*?)}\s+from\s+['"]@mui\/material\/styles['"]/, "import { alpha, $1 } from '@mui/material/styles'");
      } else if (content.match(/import\s+{.*}\s+from\s+['"]@mui\/material['"]/)) {
        content = content.replace(/import\s+{(.*?)}\s+from\s+['"]@mui\/material['"]/, "import { alpha, $1 } from '@mui/material'");
      } else {
        content = `import { alpha } from '@mui/material/styles';\n` + content;
      }
      fs.writeFileSync(file, content);
      console.log(`Fixed alpha in: ${file}`);
    }
  });
}
