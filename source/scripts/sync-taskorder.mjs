// Keeps src/taskorder.json, the fixed numbered list of every task used by backup codes, append-only.
// Run `node scripts/sync-taskorder.mjs` after the task data changes. It only ever adds new tasks to the END.
// Never reorder or delete lines in taskorder.json: a task's position in that list is its bit in every backup code ever made.
import fs from 'fs';
const tasks=JSON.parse(fs.readFileSync(new URL('../src/tasks.json',import.meta.url)));
const f=new URL('../src/taskorder.json',import.meta.url);
const order=fs.existsSync(f)?JSON.parse(fs.readFileSync(f)):[];
const have=new Set(order);let add=0;
for(const [t,l] of Object.entries(tasks))for(const x of l){const k='tk:'+t+':'+x;if(!have.has(k)){order.push(k);have.add(k);add++}}
fs.writeFileSync(f,JSON.stringify(order));
console.log('taskorder.json:',order.length,'tasks,',add,'added');
