// Public client configuration only. Never put service-role, SMTP or Google secrets here.
// Configure using: node scripts/configure-auth.mjs --url ... --key ... --email --google
export const authConfig = Object.freeze({url:'',publishableKey:'',emailEnabled:false,googleEnabled:false});
