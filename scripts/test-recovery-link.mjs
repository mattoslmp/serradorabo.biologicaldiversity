import assert from 'node:assert/strict';
import {extractRecoveryToken} from '../lib/recoveryLink.mjs';
const project='https://dgxrsvfpaenuxiuttkea.supabase.co';
const token='a'.repeat(64);
const link=project+'/auth/v1/verify?token='+token+
  '&type=recovery&redirect_to=http%3A%2F%2Flocalhost%3A3000';
assert.equal(extractRecoveryToken(link,project),token);
assert.equal(extractRecoveryToken('  '+link+'  ',project),token);
assert.throws(()=>extractRecoveryToken(link.replace('type=recovery','type=invite'),project));
assert.throws(()=>extractRecoveryToken(link.replace(token,'short'),project));
assert.throws(()=>extractRecoveryToken(link,'https://another-project.supabase.co'));
assert.throws(()=>extractRecoveryToken(link.replace('https:','http:'),project));
assert.throws(()=>extractRecoveryToken(link+'&token='+token,project));
assert.throws(()=>extractRecoveryToken('http://localhost:3000/#access_token=secret',project));
console.log('PASS: recovery link validation is project-bound and rejects unsafe/invalid tokens.');
