// extrait les icônes Lucide (trait) du paquet react-icons installé → JSON {Nom: "<path…/>"}
const fs=require('fs');const s=fs.readFileSync('/opt/npm-tools/node_modules/react-icons/lu/index.js','utf8');const O={};
const att=a=>Object.entries(a).map(([k,v])=>k.replace(/[A-Z]/g,m=>'-'+m.toLowerCase())+'="'+v+'"').join(' ');
const ser=n=>n.map(c=>'<'+c.tag+' '+att(c.attr)+'/>').join('');
for(const m of s.matchAll(/module\.exports\.Lu(\w+) = function \w+ \(props\) \{\n  return GenIcon\((.*)\)\(props\);/g)){const j=JSON.parse(m[2]);O[m[1]]=ser(j.child)}
fs.writeFileSync('/tmp/lucide.json',JSON.stringify(O));console.log(Object.keys(O).length);
