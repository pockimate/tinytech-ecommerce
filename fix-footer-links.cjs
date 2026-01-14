const fs = require('fs');

let content = fs.readFileSync('App.tsx', 'utf8');

// Fix footer links
content = content.replace(
  /navigate\('refund'\)\} className="text-gray-400 hover:text-white transition-colors"><TranslatedText fallback="Return & Refund"/g,
  `navigate('refund-policy')} className="text-gray-400 hover:text-white transition-colors"><TranslatedText fallback="Refund Policy"`
);

content = content.replace(
  /navigate\('privacy'\)\} className="text-gray-400 hover:text-white transition-colors"><TranslatedText fallback="Privacy & ToS"/g,
  `navigate('privacy-policy')} className="text-gray-400 hover:text-white transition-colors"><TranslatedText fallback="Privacy Policy"`
);

// Add Terms of Service link after Privacy Policy
content = content.replace(
  /(<li><button onClick=\{\(\) => navigate\('privacy-policy'\)\} className="text-gray-400 hover:text-white transition-colors"><TranslatedText fallback="Privacy Policy" \/><\/button><\/li>)\s*(<\/ul>)/g,
  `$1
                <li><button onClick={() => navigate('terms-of-service')} className="text-gray-400 hover:text-white transition-colors"><TranslatedText fallback="Terms of Service" /></button></li>
              $2`
);

fs.writeFileSync('App.tsx', content);
console.log('Footer links updated!');
