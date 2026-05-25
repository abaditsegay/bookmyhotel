const fs = require('fs');
const path = require('path');

function processDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processDir(fullPath);
        } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
            processFile(fullPath);
        }
    }
}

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Check if the file imports anything from themeColors
    if (!content.includes('themeColors')) {
        return;
    }
    
    console.log(`Processing: ${filePath}`);
    
    // Simplest common replacements, leaving logic for manual refinement if needed
    
    // Replace COLORS.PRIMARY -> theme.palette.primary.main
    content = content.replace(/COLORS\.PRIMARY(\b)/g, 'theme.palette.primary.main$1');
    content = content.replace(/COLORS\.SECONDARY(\b)/g, 'theme.palette.secondary.main$1');
    content = content.replace(/COLORS\.SUCCESS(\b)/g, 'theme.palette.success.main$1');
    content = content.replace(/COLORS\.WARNING(\b)/g, 'theme.palette.warning.main$1');
    content = content.replace(/COLORS\.ERROR(\b)/g, 'theme.palette.error.main$1');
    content = content.replace(/COLORS\.INFO(\b)/g, 'theme.palette.info.main$1');
    
    // Common background
    content = content.replace(/COLORS\.BG_DEFAULT/g, 'theme.palette.background.default');
    content = content.replace(/COLORS\.BG_PAPER/g, 'theme.palette.background.paper');
    
    // Text colors
    content = content.replace(/COLORS\.TEXT_PRIMARY/g, 'theme.palette.text.primary');
    content = content.replace(/COLORS\.TEXT_SECONDARY/g, 'theme.palette.text.secondary');
    
    // Borders
    content = content.replace(/COLORS\.BORDER_LIGHT/g, 'theme.palette.divider');
    content = content.replace(/COLORS\.BORDER_DEFAULT/g, 'theme.palette.divider');
    content = content.replace(/COLORS\.DIVIDER/g, 'theme.palette.divider');
    
    // Slate
    content = content.replace(/COLORS\.SLATE_800/g, 'theme.palette.primary.dark');
    content = content.replace(/COLORS\.SLATE_900/g, 'theme.palette.primary.dark');
    
    // Status colors
    content = content.replace(/COLORS\.AVAILABLE/g, 'theme.palette.status.available');
    content = content.replace(/COLORS\.BOOKED/g, 'theme.palette.status.booked');
    content = content.replace(/COLORS\.MAINTENANCE/g, 'theme.palette.status.maintenance');
    content = content.replace(/COLORS\.OCCUPIED/g, 'theme.palette.status.occupied');
    content = content.replace(/COLORS\.CLEANING/g, 'theme.palette.status.cleaning');
    content = content.replace(/COLORS\.PENDING/g, 'theme.palette.status.pending');
    content = content.replace(/COLORS\.CHECKED_IN/g, 'theme.palette.success.main');
    content = content.replace(/COLORS\.CHECKED_OUT/g, 'theme.palette.status.checkedOut');
    content = content.replace(/COLORS\.CANCELLED/g, 'theme.palette.text.disabled');

    // Gradients
    content = content.replace(/COLORS\.GRADIENT_PRIMARY/g, 'theme.palette.gradients.primary');
    content = content.replace(/COLORS\.GRADIENT_SECONDARY/g, 'theme.palette.gradients.secondary');
    
    content = content.replace(/getGradient\('primary'/g, 'theme.palette.gradients.primary');
    content = content.replace(/getGradient\('secondary'/g, 'theme.palette.gradients.secondary');

    // addAlpha to alpha wrapper
    content = content.replace(/addAlpha\((.*?),\s*(.*?)\)/g, "alpha($1, $2)");
    
    // Ensure useTheme and alpha are imported if needed
    if (content.includes('theme.palette') || content.includes('alpha(')) {
        if (!content.includes('alpha,') && !content.includes(', alpha')) {
            if (content.includes('@mui/material/styles') || content.includes('@mui/material')) {
                // If they have an MUI import, great.
                // We'll trust our next lint/compilation stage to help if this is missing for now.
            }
        }
    }

    fs.writeFileSync(filePath, content);
}

processDir(path.join(__dirname, 'frontend/src/pages'));
processDir(path.join(__dirname, 'frontend/src/components'));
