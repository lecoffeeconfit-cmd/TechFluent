const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
function run(args) {
  const r = spawnSync(process.execPath, args, { stdio: 'inherit' });
  if (r.status !== 0) process.exit(r.status || 1);
}
run([require.resolve('typescript/bin/tsc'), '-p', 'tsconfig.test.json']);
if (process.argv.includes('--seed')) {
  const {expandedLessons} = require('../.test-build/content/catalog');
  const {curriculumVersion} = require('../.test-build/content/model');
  const {normalize} = require('../.test-build/core/learning');
  const literal = s => "'"+s.replaceAll("'","''")+"'";
  const rows=expandedLessons.flatMap(c=>c.checks.map((q,i)=>
    '('+[literal(curriculumVersion),literal(c.id),i,literal(q.kind),'ARRAY['+q.answer.map(a=>literal(normalize(a))).join(',')+']'].join(', ')+')'));
  fs.writeFileSync('supabase/migrations/003_expanded_assessments.sql','-- Generated from the expanded curriculum with npm run curriculum:sql.\ninsert into tf_private.assessments(curriculum,concept_id,step,kind,solutions) values\n'+rows.join(',\n')+'\non conflict (curriculum,concept_id,step) do nothing;\n');
} else {
  run(['--test', ...fs.readdirSync('tests').filter(f=>f.endsWith('.test.cjs') && (process.argv.includes('--ui') ? f==='interface.test.cjs' : f!=='interface.test.cjs')).map(f=>path.join('tests',f))]);
}
