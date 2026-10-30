for(const C of [Map,WeakMap]){C.prototype.getOrInsertComputed=function(k,f){if(!this.has(k))this.set(k,f(k));return this.get(k)};C.prototype.getOrInsert=function(k,v){if(!this.has(k))this.set(k,v);return this.get(k)}}
await import('./pdf.worker.min.mjs');
