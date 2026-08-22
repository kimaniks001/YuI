import fs from 'node:fs';

const failures = [];
const read = (path) => fs.readFileSync(path, 'utf8');
const preview = read('src/pages/PreviewWorkspacePage.tsx');
const live = read('src/pages/AgreementDetail.tsx');
const wrapper = read('src/pages/AgreementDetailWorkspace.tsx');
const css = read('src/batch4-agreement-workspace.css');
const doc = read('docs/design/AGREEMENT_WORKSPACE_VISUAL_LOCK_V1.md');

function expect(source, text, message) {
  if (!source.includes(text)) failures.push(message);
}

expect(preview, 'What happened', 'Workspace lost the what-happened layer');
expect(preview, 'What it means', 'Workspace lost the meaning layer');
expect(preview, 'What you can do next', 'Workspace lost the next-action layer');
expect(preview, 'Your role ·', 'Workspace lost explicit role framing');
expect(preview, 'Creating an agreement does not automatically make someone the payer.', 'Creator ≠ payer visual law is missing');
expect(preview, 'This preview does not invent evidence records.', 'Preview evidence safety wording is missing');
expect(preview, 'projection.money.paymentReady', 'Payment Ready is no longer bound to projection truth');
expect(preview, 'LivingSecurePayMark state={markState}', 'Living SecurePay Mark no longer carries the agreement posture');
expect(wrapper, 'Your agreement workspace', 'Canonical agreement route lost its workspace room framing');
expect(wrapper, "import '../batch4-agreement-workspace.css';", 'Canonical workspace does not load V7 presentation');
expect(live, 'b4-agreement-card', 'Canonical agreement cards no longer receive V7 room styling');
expect(live, "state={action.urgency === 'high' ? 'caution' : 'guiding'}", 'Canonical next action no longer uses Living Mark posture');
expect(css, '.b4-workspace-grid', 'V7 desktop workspace grid is missing');
expect(css, '@media (max-width: 600px)', 'V7 mobile treatment is missing');
expect(doc, 'Creator / proposer is not automatically the payer.', 'V7 role law is missing from the visual lock');

console.log('\n=== SecurePay Batch 04 visual guard ===');
if (failures.length) {
  failures.forEach((failure) => console.error(`FAIL: ${failure}`));
  process.exit(1);
}
console.log('PASSED: V7 Agreement Workspace visual-lock invariants are present.');
