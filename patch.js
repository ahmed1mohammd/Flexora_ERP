const fs = require('fs');
const path = 'd:/Projects/FLEXORA/landingPage/index.html';
let content = fs.readFileSync(path, 'utf8');

// 1. Add IDs to phone and email
content = content.replace(
    /<span class="font-mono text-\[11px\]">\+20 101 234 5678<\/span>/g,
    '<span id="dynamic-support-phone" class="font-mono text-[11px]" dir="ltr">+20 101 234 5678</span>'
);
content = content.replace(
    /<span class="font-mono text-\[11px\] hover:text-primary transition-colors cursor-pointer">support@flexora\.com<\/span>/g,
    '<span id="dynamic-support-email" class="font-mono text-[11px] hover:text-primary transition-colors cursor-pointer">support@flexora.com</span>'
);

// 2. Replace Tech Partner Block with Powered By Snap Tech
const techPartnerRegex = /<!-- Tech Partner Cyber Badge -->[\s\S]*?(?=<\/div>\s*<\/div>\s*<\/footer>)/;
const newTechPartner = `<!-- Powered By Snap Tech Badge -->
                <a href="#" class="flex items-center gap-3 px-5 py-2.5 rounded-xl border border-primary/30 bg-primary/5 hover:border-primary/60 hover:bg-primary/10 transition-all duration-300 group shadow-[0_0_15px_rgba(229,9,20,0.15)]" id="snaptech-footer-brand">
                    <div class="flex flex-col text-right">
                        <span class="text-[9px] text-text_muted/70 tracking-widest uppercase">Powered by</span>
                        <span class="font-bold text-primary text-sm flex items-center gap-1.5">
                            <i class="fa-solid fa-bolt text-[11px] text-yellow-400"></i>
                            Snap Tech
                        </span>
                    </div>
                    <!-- Logo Placeholder -->
                    <div class="w-9 h-9 rounded-full bg-black border border-primary/50 flex items-center justify-center overflow-hidden">
                        <img id="snaptech-logo" src="https://via.placeholder.com/150/000000/E50914?text=ST" alt="Snap Tech Logo" class="w-full h-full object-cover">
                    </div>
                </a>
            </div>`;
content = content.replace(techPartnerRegex, newTechPartner);

// 3. Update Hydration Script
const legalInjectRegex = /\/\/ Render Legal Credentials[\s\S]*?(?=\s*}\s*}\s*catch \(e\))/;
const newHydration = `// Render Legal Credentials
            if (settings.showLegalFooter) {
              const legalContainer = document.getElementById('dynamic-legal-footer');
              if (legalContainer) {
                legalContainer.innerHTML = \`
                  <div class="mt-4 pt-4 border-t border-border/50 text-[10px] text-text_muted/70">
                    <p>الرقم الضريبي: \${settings.taxNumber || 'غير مدرج'}</p>
                    <p>السجل التجاري: \${settings.commercialRecord || 'غير مدرج'}</p>
                  </div>
                \`;
              }
            }
            
            // Render Dynamic Phone/Email
            if (settings.supportPhone) {
                const phoneEl = document.getElementById('dynamic-support-phone');
                if (phoneEl) {
                    phoneEl.textContent = settings.supportPhone;
                }
            }
            if (settings.supportEmail) {
                const emailEl = document.getElementById('dynamic-support-email');
                if (emailEl) {
                    emailEl.textContent = settings.supportEmail;
                }
            }

            // Bind Global WhatsApp Links (Pricing plans, etc.)
            if (settings.showWhatsapp && settings.whatsappUrl) {
                const dynamicWa = formatUrl(settings.whatsappUrl, true);
                document.querySelectorAll('a[href*="wa.me"]').forEach(el => {
                    // Update any static whatsapp links (like in pricing)
                    el.href = dynamicWa;
                });
            }
`;
content = content.replace(legalInjectRegex, newHydration);

fs.writeFileSync(path, content, 'utf8');
console.log("Replacements successful.");
