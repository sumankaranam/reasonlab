import {writeFile} from 'node:fs/promises';import {validConfig} from '../public/auth-core.js';
const args=process.argv.slice(2);const value=flag=>args[args.indexOf(flag)+1];
const config={url:args.includes('--url')?value('--url'):'',publishableKey:args.includes('--key')?value('--key'):'',googleEnabled:args.includes('--google'),emailEnabled:args.includes('--email')};
if(!validConfig(config))throw Error('Supply a hosted Supabase HTTPS project URL and a PUBLIC publishable/anon key. Never use a secret or service-role key.');
await writeFile(new URL('../public/auth-config.js',import.meta.url),'// Public Supabase configuration. No server secrets.\nexport const authConfig = Object.freeze('+JSON.stringify(config,null,2)+');\n');console.log('Public auth configuration saved. Deploy after provider setup and verification.');
