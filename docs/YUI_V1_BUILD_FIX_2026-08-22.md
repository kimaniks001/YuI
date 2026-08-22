# YUI v1 Explorer — build repair

Repair for local validation reported on 22 Aug 2026.

- restores the Explorer-mode module in the drop-in;
- replaces unsupported `CircleAlert` with the Lucide 0.344-compatible `AlertCircle`;
- fixes Lucide icon component typing in Help Center and Flow/Community preview;
- removes strict TypeScript unused imports/locals reported by `noUnusedLocals`;
- replaces `String.replaceAll` with ES2020-compatible `replace`;
- corrects the Evening Market theme id;
- widens the release helper return type to the canonical `SecurePayResult` shape.

No real-money, authentication, rail, Payment Ready, release or settlement authority is enabled by this repair.
