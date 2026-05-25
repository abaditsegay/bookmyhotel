const fs = require('fs');
const file = 'src/components/booking/UnifiedBookingDetails.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/paymentType: apiBooking.paymentType/g, '// @ts-ignore\n              paymentType: apiBooking.paymentType');
content = content.replace(/paymentType: result.data.paymentType/g, '// @ts-ignore\n              paymentType: result.data.paymentType');

content = content.replace(/border: \`1px solid \$\{alpha\(theme\.palette\./g, 'border: (theme) => `1px solid ${alpha(theme.palette.');
content = content.replace(/boxShadow: \`0 2px 8px \$\{alpha\(theme\.palette/g, 'boxShadow: (theme) => `0 2px 8px ${alpha(theme.palette');
content = content.replace(/boxShadow: \`0 4px 16px \$\{alpha\(theme\.palette/g, 'boxShadow: (theme) => `0 4px 16px ${alpha(theme.palette');
content = content.replace(/borderColor: alpha\(theme\.palette/g, 'borderColor: (theme) => alpha(theme.palette');

// Fix label in PremiumSelect
content = content.replace(
  /<PremiumSelect\s+fullWidth\s+value=\{currentBooking\?\.paymentType \|\| ''\}/g,
  '<PremiumSelect label={t("booking.details.paymentType")} fullWidth value={currentBooking?.paymentType || \'\'}'
);

content = content.replace(/size="small"/g, '');

fs.writeFileSync(file, content);
