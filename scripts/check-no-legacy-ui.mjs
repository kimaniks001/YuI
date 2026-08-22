#!/usr/bin/env node
import { existsSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const forbidden = [
  'src/App.tsx',
  'src/pages/CreateTypePicker.tsx',
  'src/pages/CreateSecureLinkEntry.tsx',
  'src/pages/CreateSecureLink.tsx',
  'src/pages/CreateCollectionLink.tsx',
  'src/pages/CollectionLinkBuilder.tsx',
  'src/pages/CollectionDashboard.tsx',
  'src/pages/CollectionLinkView.tsx',
  'src/pages/DeveloperWorkspace.tsx',
  'src/pages/PaymentPage.tsx',
  'src/pages/DisputePage.tsx',
  'src/pages/MediationLookup.tsx',
  'src/pages/WalletDashboard.tsx',
  'src/pages/SecureFlowCreate.tsx',
  'src/pages/GroupSecureFlowCreate.tsx',
  'src/admin',
  'src/pages/restorder',
  'src/lib/supabase.ts',
];

const found = forbidden.filter(path => existsSync(join(ROOT, path)));
console.log('\n=== YuI legacy presentation guard ===');
if (found.length) {
  console.error('FAILED: superseded/isolated UI resurfaced in the clean frontend:');
  for (const path of found) console.error(` - ${path}`);
  process.exit(1);
}
console.log('PASSED: no retired UI family is present in the clean frontend.\n');
