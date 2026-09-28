import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { runInNewContext } from 'node:vm'
import ts from 'typescript'
const source=readFileSync(new URL('../src/components/realmDiscoveryScoring.ts',import.meta.url),'utf8')
const exports={}
runInNewContext(ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,{exports})
const {QUESTIONS,REALMS,matchRealm}=exports
const winners=new Set()
for(let n=0;n<4**5;n++){
 const answers=Array.from({length:5},(_,i)=>(n>>(i*2))&3)
 const result=matchRealm(answers)
 assert.equal(JSON.stringify(result),JSON.stringify(matchRealm(answers)))
 assert.ok(result.percent>=0&&result.percent<=100)
 assert.ok(Number.isInteger(result.percent))
 assert.ok(result.reason.includes(result.realm.name))
 winners.add(result.realm.slug)
}
assert.equal(winners.size,8,'Every realm must be reachable')
for(const q of QUESTIONS)for(const option of q.options){assert.equal(option.scores.length,REALMS.length);assert.ok(option.scores.every(s=>s>=0&&s<=5))}
for(const answers of [[],[0],[0,0,0,0,4],[0,0,0,0,-1],[0,0,0,0,0.5],[0,0,0,0,0,0]])assert.throws(()=>matchRealm(answers))
console.log('PASS: all 1024 paths deterministic and bounded; all 8 realms reachable; invalid answers rejected.')
