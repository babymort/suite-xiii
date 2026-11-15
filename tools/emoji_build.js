// génère xiii-src/suite-emoji.js : table émoji → icône au trait (Lucide, licence ISC, via le paquet react-icons installé)
const fs=require('fs');require('/home/claude/tools/lucide_extract.js');const O=require('/tmp/lucide.json');
const M={},I={};for(const l of fs.readFileSync('/home/claude/tools/emoji_map.txt','utf8').trim().split('\n')){const [e,n]=l.trim().split(/\s+/);if(!O[n])continue;M[e.replace(/️/g,'')]=n;I[n]=O[n]}
const tpl=fs.readFileSync('/home/claude/tools/emoji_tpl.js','utf8');
fs.writeFileSync('/home/claude/xiii-src/suite-emoji.js',tpl.replace('/*@@I@@*/{}',JSON.stringify(I)).replace('/*@@M@@*/{}',JSON.stringify(M)));
console.log(Object.keys(M).length+' émojis → '+Object.keys(I).length+' icônes');
