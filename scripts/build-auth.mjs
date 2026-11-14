import {build} from 'esbuild';import {mkdir,copyFile} from 'node:fs/promises';
await mkdir(new URL('../public/vendor/',import.meta.url),{recursive:true});
await build({stdin:{contents:"export {createClient} from '@supabase/supabase-js';",resolveDir:process.cwd()},bundle:true,format:'esm',platform:'browser',target:['es2022'],minify:true,legalComments:'eof',outfile:'public/vendor/supabase.js'});
await copyFile('node_modules/@supabase/supabase-js/LICENSE','public/vendor/SUPABASE-LICENSE.txt');
