import { useCallback, useEffect, useRef, useState } from 'react';
import {
  activateGroupSecureLink, appointGroupSecureLinkOrganizer, activateGroupGovernancePolicy,
  cancelGroupSecureLink, createGroupGovernancePolicy, createGroupSecureLink,
  getGroupSecureLinkCapabilities, getIdentityByKsNumber, getPrivateGroupSecureLink,
  issueGroupSecureLinkPublicLocator, revokeGroupSecureLinkOrganizer,
} from '../../api/securepayEndpoints';
import type {
  AppointGroupOrganizerRequestBody, CreateGovernancePolicyRequestBody, CreateGroupSecureLinkRequestBody,
  IssueGroupPublicLocatorRequestBody, RevokeGroupOrganizerRequestBody, SecurePayGroupSecureLinkCapabilities,
  SecurePayPrivateGroupSecureLink, SecurePayRetrievedIdentity,
} from '../../api/securepayTypes';
import { formatMinorMoney } from '../../lib/formatMinorMoney';
import {
  activationBlockerLabel, CREATABLE_GOVERNED_ACTION_TYPES, governedActionLabel, governanceStatusLabel,
  groupGovernanceNextStep, groupStatusLabel, groupTargetTypeLabel, groupTypeLabel,
  organizerAuthorityScopeLabel, organizerRoleLabel,
} from '../../lib/groupSecureLinkPresentation';
import GroupContributionPanel from './GroupContributionPanel';

type ReadState = 'loading' | 'missing' | 'forbidden' | 'error' | 'ready';

const safeMoney = (currency: string, value: number | null) =>
  value != null && Number.isSafeInteger(value) && value >= 0 ? formatMinorMoney(currency, value) : null;

const CAPABILITY_KEYS = [
  'canActivate', 'canCancel', 'canManageOrganizers', 'canManageGovernance',
  'canCreateApprovalRequest', 'canDecideApproval', 'canRecordContributionIntent',
  'canReadOwnContribution', 'canManagePublicLocator',
] as const;

function isCapabilities(value: unknown): value is SecurePayGroupSecureLinkCapabilities {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Record<string, unknown>;
  if (!CAPABILITY_KEYS.every(key => typeof candidate[key] === 'boolean')) return false;
  if (!candidate.activation || typeof candidate.activation !== 'object') return false;
  const activation = candidate.activation as Record<string, unknown>;
  return typeof activation.allowedNow === 'boolean'
    && Array.isArray(activation.blockingReasonCodes)
    && activation.blockingReasonCodes.every(code => typeof code === 'string');
}

export default function GroupSecureLinkSection({ agreementId, authHeader }: { agreementId: string; authHeader: string }) {
  const [state, setState] = useState<ReadState>('loading');
  const [group, setGroup] = useState<SecurePayPrivateGroupSecureLink | null>(null);
  const [capabilities, setCapabilities] = useState<SecurePayGroupSecureLinkCapabilities | null>(null);
  const [capabilityState, setCapabilityState] = useState<'idle' | 'loading' | 'error' | 'ready'>('idle');
  const [activating, setActivating] = useState(false);
  const [activationError, setActivationError] = useState<string | null>(null);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [submittedCancelReason, setSubmittedCancelReason] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [groupType, setGroupType] = useState<'WELFARE' | 'GENERAL'>('GENERAL');
  const [title, setTitle] = useState('');
  const [purpose, setPurpose] = useState('');

  // Organizer appointment
  const [appointOpen, setAppointOpen] = useState(false);
  const [appointKsNumber, setAppointKsNumber] = useState('');
  const [appointLookupState, setAppointLookupState] = useState<'idle' | 'loading' | 'error' | 'found'>('idle');
  const [appointIdentity, setAppointIdentity] = useState<SecurePayRetrievedIdentity | null>(null);
  const [appointRole, setAppointRole] = useState<AppointGroupOrganizerRequestBody['organizerRole']>('ORGANIZER');
  const [appointScope, setAppointScope] = useState<AppointGroupOrganizerRequestBody['authorityScope']>('VIEW');
  const [appointSubmitting, setAppointSubmitting] = useState(false);
  const [appointError, setAppointError] = useState<string | null>(null);
  const appointingRef = useRef(false);

  // Organizer revocation
  const [revokeOpenId, setRevokeOpenId] = useState<string | null>(null);
  const [revokeReason, setRevokeReason] = useState('');
  const [revoking, setRevoking] = useState(false);
  const [revokeError, setRevokeError] = useState<string | null>(null);
  const revokingRef = useRef(false);
  const revokeKeyRef = useRef(crypto.randomUUID());

  // Governance policy creation
  const [policyFormOpen, setPolicyFormOpen] = useState(false);
  const [policyAction, setPolicyAction] = useState<CreateGovernancePolicyRequestBody['governedActionType']>('PROPOSE_RELEASE');
  const [policyMinApprovals, setPolicyMinApprovals] = useState('1');
  const [policyQuorumPct, setPolicyQuorumPct] = useState('');
  const [policyExpiryHours, setPolicyExpiryHours] = useState('');
  const [policyMakerChecker, setPolicyMakerChecker] = useState(false);
  const [approverKsNumber, setApproverKsNumber] = useState('');
  const [approverLookupState, setApproverLookupState] = useState<'idle' | 'loading' | 'error'>('idle');
  const [approverLookupError, setApproverLookupError] = useState<string | null>(null);
  const [approvers, setApprovers] = useState<{ identityId: string; ksNumber: string; displayName: string }[]>([]);
  const [policySubmitting, setPolicySubmitting] = useState(false);
  const [policyError, setPolicyError] = useState<string | null>(null);
  const policySubmittingRef = useRef(false);

  // Governance policy activation
  const [activatingPolicyId, setActivatingPolicyId] = useState<string | null>(null);
  const [policyActivateError, setPolicyActivateError] = useState<{ policyId: string; message: string } | null>(null);
  const activatingPolicyRef = useRef(false);

  // Public locator issuance (one-time reveal; not re-fetchable after issuance)
  const [locatorState, setLocatorState] = useState<'idle' | 'issuing' | 'issued' | 'error'>('idle');
  const [issuedLocator, setIssuedLocator] = useState<{ slug: string } | null>(null);
  const [locatorError, setLocatorError] = useState<string | null>(null);
  const locatorKeyRef = useRef(crypto.randomUUID());
  const issuingLocatorRef = useRef(false);

  const requestRef = useRef(0);
  const capabilityRequestRef = useRef(0);
  const mountedRef = useRef(true);
  const submittingRef = useRef(false);
  const activatingRef = useRef(false);
  const cancellingRef = useRef(false);
  const cancellationKeyRef = useRef(crypto.randomUUID());
  const creationMayExistRef = useRef(false);
  const contextRef = useRef(`${agreementId}|${authHeader}`);
  contextRef.current = `${agreementId}|${authHeader}`;

  const read = useCallback(async () => {
    const request = ++requestRef.current;
    setState('loading');
    const result = await getPrivateGroupSecureLink(agreementId, authHeader);
    if (!mountedRef.current || request !== requestRef.current) return null;
    if (result.ok && result.data && result.data.agreementId === agreementId) {
      creationMayExistRef.current = true;
      setGroup(result.data); setState('ready'); setFormOpen(false); return result.data;
    }
    setGroup(null);
    if (result.status === 404 && !creationMayExistRef.current) setState('missing');
    else if (result.status === 404) setState('error');
    else if (result.status === 401 || result.status === 403) setState('forbidden');
    else setState('error');
    return null;
  }, [agreementId, authHeader]);

  const readCapabilities = useCallback(async () => {
    const request = ++capabilityRequestRef.current;
    setCapabilityState('loading');
    setCapabilities(null);
    const result = await getGroupSecureLinkCapabilities(agreementId, authHeader);
    if (!mountedRef.current || request !== capabilityRequestRef.current) return;
    if (result.ok && isCapabilities(result.data)) {
      setCapabilities(result.data);
      setCapabilityState('ready');
    } else {
      setCapabilityState('error');
    }
  }, [agreementId, authHeader]);

  useEffect(() => {
    mountedRef.current = true;
    submittingRef.current = false;
    creationMayExistRef.current = false;
    activatingRef.current = false;
    cancellingRef.current = false;
    cancellationKeyRef.current = crypto.randomUUID();
    setGroup(null); setCapabilities(null); setCapabilityState('idle'); setFormOpen(false); setError(null); setActivationError(null); setSubmitting(false); setActivating(false);
    setCancelOpen(false); setCancelReason(''); setSubmittedCancelReason(null); setCancelling(false); setCancelError(null);
    appointingRef.current = false;
    setAppointOpen(false); setAppointKsNumber(''); setAppointLookupState('idle'); setAppointIdentity(null);
    setAppointRole('ORGANIZER'); setAppointScope('VIEW'); setAppointSubmitting(false); setAppointError(null);
    revokingRef.current = false; revokeKeyRef.current = crypto.randomUUID();
    setRevokeOpenId(null); setRevokeReason(''); setRevoking(false); setRevokeError(null);
    policySubmittingRef.current = false;
    setPolicyFormOpen(false); setPolicyAction('PROPOSE_RELEASE'); setPolicyMinApprovals('1'); setPolicyQuorumPct('');
    setPolicyExpiryHours(''); setPolicyMakerChecker(false); setApproverKsNumber(''); setApproverLookupState('idle');
    setApproverLookupError(null); setApprovers([]); setPolicySubmitting(false); setPolicyError(null);
    activatingPolicyRef.current = false;
    setActivatingPolicyId(null); setPolicyActivateError(null);
    issuingLocatorRef.current = false; locatorKeyRef.current = crypto.randomUUID();
    setLocatorState('idle'); setIssuedLocator(null); setLocatorError(null);
    void read().then(found => { if (found && mountedRef.current) void readCapabilities(); });
    return () => { mountedRef.current = false; requestRef.current += 1; capabilityRequestRef.current += 1; };
  }, [read, readCapabilities]);

  const activate = async () => {
    if (activatingRef.current || group?.status !== 'DRAFT' || capabilities?.canActivate !== true || capabilities.activation.allowedNow !== true) return;
    activatingRef.current = true;
    setActivating(true); setActivationError(null);
    const submittedContext = `${agreementId}|${authHeader}`;
    const result = await activateGroupSecureLink(agreementId, authHeader);
    if (!mountedRef.current || contextRef.current !== submittedContext) return;
    if (result.ok) {
      await Promise.all([read(), readCapabilities()]);
    } else {
      setActivationError(result.status === 403
        ? 'You are no longer authorized to activate this group.'
        : result.status === 404
          ? 'This Group SecureLink is no longer available.'
          : result.status === 409 || result.status === 422
            ? 'This group is not ready for activation now. SecurePay has checked its latest state.'
            : 'Activation is unavailable right now. Please try again.');
      await Promise.all([read(), readCapabilities()]);
    }
    if (mountedRef.current && contextRef.current === submittedContext) {
      activatingRef.current = false;
      setActivating(false);
    }
  };

  const submit = async () => {
    if (!title.trim() || !purpose.trim() || submittingRef.current) return;
    submittingRef.current = true;
    setSubmitting(true); setError(null);
    const submittedContext = `${agreementId}|${authHeader}`;
    // Exact minimal backend request: no invented membership, money movement,
    // governance, authority, locator, or idempotency fields.
    const body: CreateGroupSecureLinkRequestBody = {
      groupType, title: title.trim(), statedPurpose: purpose.trim(), targetType: 'OPEN_ENDED',
    };
    const result = await createGroupSecureLink(agreementId, body, authHeader);
    if (!mountedRef.current || contextRef.current !== submittedContext) return;
    if (result.ok || result.status === 409) {
      creationMayExistRef.current = true;
      const found = await read();
      if (found && mountedRef.current && contextRef.current === submittedContext) void readCapabilities();
      if (!found && mountedRef.current && contextRef.current === submittedContext) {
        setState('error');
        setError('The Group SecureLink could not be loaded. Please try again.');
      }
    } else if (result.status === 403) {
      setError('You cannot create a Group SecureLink for this agreement.');
    } else {
      setError('The Group SecureLink could not be created. Please try again.');
    }
    if (mountedRef.current && contextRef.current === submittedContext) {
      submittingRef.current = false;
      setSubmitting(false);
    }
  };

  const cancel = async () => {
    const reason = submittedCancelReason ?? cancelReason.trim();
    if (cancellingRef.current || !reason || capabilities?.canCancel !== true
      || (group?.status !== 'DRAFT' && group?.status !== 'ACTIVE')) return;
    cancellingRef.current = true;
    setSubmittedCancelReason(reason);
    setCancelling(true); setCancelError(null);
    const submittedContext = `${agreementId}|${authHeader}`;
    const result = await cancelGroupSecureLink(
      agreementId,
      { idempotencyKey: cancellationKeyRef.current, reason },
      authHeader,
    );
    if (!mountedRef.current || contextRef.current !== submittedContext) return;
    if (!result.ok) {
      setCancelError(result.status === 403
        ? 'You are no longer authorized to cancel this group.'
        : result.status === 404
          ? 'This Group SecureLink is no longer available.'
          : result.status === 409 || result.status === 422
            ? 'This group cannot be cancelled in its latest state.'
            : 'Cancellation is unavailable right now. Please try again.');
    }
    const [refreshedGroup] = await Promise.all([read(), readCapabilities()]);
    if (result.ok && refreshedGroup?.status === 'CANCELLED') {
      cancellationKeyRef.current = crypto.randomUUID();
      setCancelOpen(false); setCancelReason(''); setSubmittedCancelReason(null);
    } else if (result.ok && refreshedGroup) {
      setCancelError('SecurePay responded, but cancellation is not confirmed in the latest group details. Check again before retrying.');
    } else if (result.ok) {
      setError('Cancellation could not be confirmed because the latest Group SecureLink details are unavailable. Try loading them again.');
    }
    if (mountedRef.current && contextRef.current === submittedContext) {
      cancellingRef.current = false;
      setCancelling(false);
    }
  };

  const lookupAppointIdentity = async () => {
    if (!appointKsNumber.trim() || appointLookupState === 'loading') return;
    setAppointLookupState('loading'); setAppointError(null); setAppointIdentity(null);
    const submittedContext = `${agreementId}|${authHeader}`;
    const result = await getIdentityByKsNumber(appointKsNumber.trim(), authHeader);
    if (!mountedRef.current || contextRef.current !== submittedContext) return;
    if (result.ok && result.data) { setAppointIdentity(result.data); setAppointLookupState('found'); }
    else {
      setAppointLookupState('error');
      setAppointError(result.status === 404 ? 'No identity was found for that KS number.' : 'That KS number could not be looked up right now.');
    }
  };

  const submitAppointOrganizer = async () => {
    if (appointingRef.current || !appointIdentity) return;
    appointingRef.current = true;
    setAppointSubmitting(true); setAppointError(null);
    const submittedContext = `${agreementId}|${authHeader}`;
    const body: AppointGroupOrganizerRequestBody = {
      organizerIdentityId: appointIdentity.identityId, organizerRole: appointRole, authorityScope: appointScope,
    };
    const result = await appointGroupSecureLinkOrganizer(agreementId, body, authHeader);
    if (!mountedRef.current || contextRef.current !== submittedContext) return;
    if (result.ok) {
      await Promise.all([read(), readCapabilities()]);
      if (mountedRef.current && contextRef.current === submittedContext) {
        setAppointOpen(false); setAppointKsNumber(''); setAppointLookupState('idle'); setAppointIdentity(null);
        setAppointRole('ORGANIZER'); setAppointScope('VIEW');
      }
    } else {
      setAppointError(result.status === 403
        ? 'You are no longer authorized to appoint organizers for this group.'
        : result.status === 409 || result.status === 422
          ? 'SecurePay could not appoint this organizer in the group’s current state.'
          : 'Appointing this organizer is unavailable right now. Please try again.');
    }
    if (mountedRef.current && contextRef.current === submittedContext) {
      appointingRef.current = false;
      setAppointSubmitting(false);
    }
  };

  const submitRevokeOrganizer = async (organizerId: string) => {
    if (revokingRef.current) return;
    revokingRef.current = true;
    setRevoking(true); setRevokeError(null);
    const submittedContext = `${agreementId}|${authHeader}`;
    const body: RevokeGroupOrganizerRequestBody = { idempotencyKey: revokeKeyRef.current, reason: revokeReason.trim() || undefined };
    const result = await revokeGroupSecureLinkOrganizer(agreementId, organizerId, body, authHeader);
    if (!mountedRef.current || contextRef.current !== submittedContext) return;
    if (result.ok) {
      await Promise.all([read(), readCapabilities()]);
      if (mountedRef.current && contextRef.current === submittedContext) {
        setRevokeOpenId(null); setRevokeReason(''); revokeKeyRef.current = crypto.randomUUID();
      }
    } else {
      setRevokeError(result.status === 403
        ? 'You are no longer authorized to revoke organizers for this group.'
        : result.status === 422
          ? 'SecurePay declined this. This may be the last organizer who can manage this group, or the assignment is no longer revocable.'
          : result.status === 404
            ? 'This organizer assignment is no longer available.'
            : 'Revoking this organizer is unavailable right now. Please try again.');
    }
    if (mountedRef.current && contextRef.current === submittedContext) {
      revokingRef.current = false;
      setRevoking(false);
    }
  };

  const lookupApprover = async () => {
    const ks = approverKsNumber.trim();
    if (!ks || approverLookupState === 'loading') return;
    setApproverLookupState('loading'); setApproverLookupError(null);
    const submittedContext = `${agreementId}|${authHeader}`;
    const result = await getIdentityByKsNumber(ks, authHeader);
    if (!mountedRef.current || contextRef.current !== submittedContext) return;
    if (result.ok && result.data) {
      const identity = result.data;
      setApprovers(current => current.some(a => a.identityId === identity.identityId)
        ? current
        : [...current, { identityId: identity.identityId, ksNumber: identity.canonicalKsNumber, displayName: identity.displayName }]);
      setApproverKsNumber(''); setApproverLookupState('idle');
    } else {
      setApproverLookupState('error');
      setApproverLookupError(result.status === 404 ? 'No identity was found for that KS number.' : 'That KS number could not be looked up right now.');
    }
  };

  const removeApprover = (identityId: string) => setApprovers(current => current.filter(a => a.identityId !== identityId));

  const submitCreatePolicy = async () => {
    const minApprovals = Number.parseInt(policyMinApprovals, 10);
    if (policySubmittingRef.current || !Number.isInteger(minApprovals) || minApprovals < 1
      || approvers.length < 1 || minApprovals > approvers.length) return;
    policySubmittingRef.current = true;
    setPolicySubmitting(true); setPolicyError(null);
    const submittedContext = `${agreementId}|${authHeader}`;
    const quorumPct = policyQuorumPct.trim() ? Number.parseFloat(policyQuorumPct) : undefined;
    const expiryHours = policyExpiryHours.trim() ? Number.parseInt(policyExpiryHours, 10) : undefined;
    const body: CreateGovernancePolicyRequestBody = {
      governedActionType: policyAction,
      minimumApprovalCount: minApprovals,
      ...(quorumPct != null && Number.isFinite(quorumPct) ? { quorumPercentage: quorumPct } : {}),
      ...(expiryHours != null && Number.isInteger(expiryHours) ? { approvalExpiryHours: expiryHours } : {}),
      makerCheckerRequired: policyMakerChecker,
      approverIdentityIds: approvers.map(a => a.identityId),
    };
    const result = await createGroupGovernancePolicy(agreementId, body, authHeader);
    if (!mountedRef.current || contextRef.current !== submittedContext) return;
    if (result.ok) {
      await read();
      if (mountedRef.current && contextRef.current === submittedContext) {
        setPolicyFormOpen(false); setPolicyAction('PROPOSE_RELEASE'); setPolicyMinApprovals('1');
        setPolicyQuorumPct(''); setPolicyExpiryHours(''); setPolicyMakerChecker(false); setApprovers([]);
      }
    } else {
      setPolicyError(result.status === 403
        ? 'You are no longer authorized to manage governance for this group.'
        : result.status === 409 || result.status === 422
          ? 'SecurePay could not create this rule in the group’s current state.'
          : 'Creating this rule is unavailable right now. Please try again.');
    }
    if (mountedRef.current && contextRef.current === submittedContext) {
      policySubmittingRef.current = false;
      setPolicySubmitting(false);
    }
  };

  const submitActivatePolicy = async (policyId: string) => {
    if (activatingPolicyRef.current) return;
    activatingPolicyRef.current = true;
    setActivatingPolicyId(policyId); setPolicyActivateError(null);
    const submittedContext = `${agreementId}|${authHeader}`;
    const result = await activateGroupGovernancePolicy(agreementId, policyId, authHeader);
    if (!mountedRef.current || contextRef.current !== submittedContext) return;
    if (result.ok) {
      await read();
    } else {
      setPolicyActivateError({ policyId, message: result.status === 403
        ? 'You are no longer authorized to activate this rule.'
        : result.status === 409 || result.status === 422
          ? 'This rule cannot be activated in its current state.'
          : 'Activating this rule is unavailable right now. Please try again.' });
    }
    if (mountedRef.current && contextRef.current === submittedContext) {
      activatingPolicyRef.current = false;
      setActivatingPolicyId(null);
    }
  };

  const issuePublicLocator = async () => {
    if (issuingLocatorRef.current) return;
    issuingLocatorRef.current = true;
    setLocatorState('issuing'); setLocatorError(null);
    const submittedContext = `${agreementId}|${authHeader}`;
    const body: IssueGroupPublicLocatorRequestBody = { idempotencyKey: locatorKeyRef.current };
    const result = await issueGroupSecureLinkPublicLocator(agreementId, body, authHeader);
    if (!mountedRef.current || contextRef.current !== submittedContext) return;
    if (result.ok && result.data) {
      setIssuedLocator({ slug: result.data.slug }); setLocatorState('issued');
    } else {
      setLocatorState('error');
      setLocatorError(result.status === 409
        ? 'An active share link already exists for this group. SecurePay allows only one active share link at a time.'
        : result.status === 422
          ? 'This group must be active before a share link can be issued.'
          : result.status === 403
            ? 'You are no longer authorized to issue a share link for this group.'
            : 'A share link could not be issued right now. Please try again.');
    }
    if (mountedRef.current && contextRef.current === submittedContext) {
      issuingLocatorRef.current = false;
    }
  };

  if (state === 'loading') return <p className="text-sm text-[#1a1a1a]/45">Loading Group SecureLink…</p>;
  if (state === 'forbidden') return <p className="text-sm text-[#1a1a1a]/55">Group SecureLink details are not available to you.</p>;
  if (state === 'error') return <div className="space-y-2"><p className="text-sm text-[#1a1a1a]/55">{error ?? 'Group SecureLink details are temporarily unavailable.'}</p><button type="button" onClick={() => void read().then(found => { if (found) void readCapabilities(); })} className="text-sm font-medium text-[#3a7a1f]">Try again</button></div>;
  if (state === 'missing') return <div className="space-y-3">
    <p className="text-sm text-[#1a1a1a]/55">No Group SecureLink is attached to this agreement yet.</p>
    {!formOpen ? <button type="button" onClick={() => setFormOpen(true)} className="rounded-xl bg-[#3a7a1f] px-4 py-2.5 text-sm font-medium text-white">Create Group SecureLink</button> : <div className="space-y-3">
      <label className="block text-sm">Type<select aria-label="Group type" value={groupType} onChange={e => setGroupType(e.target.value as 'WELFARE' | 'GENERAL')} className="mt-1 block w-full rounded-xl border p-2.5"><option value="GENERAL">General</option><option value="WELFARE">Welfare</option></select></label>
      <label className="block text-sm">Title<input aria-label="Group title" value={title} onChange={e => setTitle(e.target.value)} className="mt-1 block w-full rounded-xl border p-2.5" /></label>
      <label className="block text-sm">Purpose<textarea aria-label="Stated purpose" value={purpose} onChange={e => setPurpose(e.target.value)} className="mt-1 block w-full rounded-xl border p-2.5" /></label>
      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
      <button type="button" disabled={submitting || !title.trim() || !purpose.trim()} onClick={() => void submit()} className="rounded-xl bg-[#3a7a1f] px-4 py-2.5 text-sm font-medium text-white disabled:opacity-40">{submitting ? 'Creating…' : 'Create Group SecureLink'}</button>
    </div>}
  </div>;
  if (!group) return null;

  const canActivate = capabilityState === 'ready' && capabilities?.canActivate === true
    && capabilities.activation.allowedNow === true && group.status === 'DRAFT';
  const canCancel = capabilityState === 'ready' && capabilities?.canCancel === true
    && (group.status === 'DRAFT' || group.status === 'ACTIVE');

  const target = safeMoney(group.currency, group.targetAmountMinor);
  const dateText = (value: string | null) => {
    if (!value) return null;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date.toLocaleDateString('en-KE');
  };
  return <div className="space-y-5">
    <div><p className="text-xs font-semibold text-[#3a7a1f]">{groupStatusLabel(group.status)}</p><h3 className="text-lg font-semibold">{group.title}</h3><p className="mt-1 text-sm text-[#1a1a1a]/60">{group.statedPurpose}</p><p className="mt-2 text-xs text-[#1a1a1a]/50">{groupTypeLabel(group.groupType)} · {groupTargetTypeLabel(group.targetType)}</p></div>
    {group.targetAmountMinor != null && <p className="text-sm"><span className="font-medium">Target amount:</span> {target ?? 'Unavailable'}</p>}
    {(dateText(group.contributionDeadline) || dateText(group.expiresAt) || dateText(group.activatedAt)) && <div className="text-sm text-[#1a1a1a]/65">{dateText(group.contributionDeadline) && <p>Contribution deadline: {dateText(group.contributionDeadline)}</p>}{dateText(group.activatedAt) && <p>Activated: {dateText(group.activatedAt)}</p>}{dateText(group.expiresAt) && <p>Expires: {dateText(group.expiresAt)}</p>}</div>}
    {(group.minimumContributionMinor != null || group.maximumContributionMinor != null) && <div className="text-sm text-[#1a1a1a]/65"><p className="font-medium">Contribution limits</p>{safeMoney(group.currency, group.minimumContributionMinor) && <p>Minimum: {safeMoney(group.currency, group.minimumContributionMinor)}</p>}{safeMoney(group.currency, group.maximumContributionMinor) && <p>Maximum: {safeMoney(group.currency, group.maximumContributionMinor)}</p>}</div>}
    <div>
      <h3 className="text-sm font-semibold">Organizers</h3>
      <ul className="mt-2 space-y-2 text-sm text-[#1a1a1a]/60">{group.organizers.map(o => <li key={o.id} className="flex flex-wrap items-center justify-between gap-2">
        <span><span>{organizerRoleLabel(o.organizerRole)}</span><span className="text-[#1a1a1a]/45"> · {organizerAuthorityScopeLabel(o.authorityScope)}{o.status !== 'ACTIVE' ? ` · ${o.status}` : ''}</span></span>
        {capabilityState === 'ready' && capabilities?.canManageOrganizers === true && o.status === 'ACTIVE' && revokeOpenId !== o.id
          && <button type="button" onClick={() => { setRevokeOpenId(o.id); setRevokeReason(''); setRevokeError(null); }} className="text-xs font-medium text-red-700">Revoke</button>}
      </li>)}</ul>
      {revokeOpenId && group.organizers.some(o => o.id === revokeOpenId) && <div className="mt-3 space-y-2 rounded-xl border border-red-200 bg-red-50/40 p-3">
        <p className="text-sm text-red-800">Revoke this organizer? This preserves history and does not remove them from any approval snapshot already open.</p>
        <label className="block text-sm">Reason (optional)<textarea aria-label="Revocation reason" value={revokeReason} disabled={revoking} onChange={e => setRevokeReason(e.target.value)} className="mt-1 block w-full rounded-xl border border-[#1a1a1a]/15 bg-white p-2" /></label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <button type="button" disabled={revoking} onClick={() => void submitRevokeOrganizer(revokeOpenId)} className="rounded-xl bg-red-700 px-3 py-2 text-sm font-medium text-white disabled:opacity-40">{revoking ? 'Revoking…' : 'Confirm revocation'}</button>
          <button type="button" disabled={revoking} onClick={() => { setRevokeOpenId(null); setRevokeReason(''); setRevokeError(null); }} className="rounded-xl border border-[#1a1a1a]/10 px-3 py-2 text-sm font-medium">Keep organizer</button>
        </div>
        {revokeError && <p role="alert" className="text-sm text-red-600">{revokeError}</p>}
      </div>}
      {capabilityState === 'ready' && capabilities?.canManageOrganizers === true && <div className="mt-3">
        {!appointOpen ? <button type="button" onClick={() => setAppointOpen(true)} className="text-sm font-medium text-[#3a7a1f]">Appoint an organizer</button> : <div className="space-y-2 rounded-xl border border-[#1a1a1a]/10 bg-[#fafaf8] p-3">
          <label className="block text-sm">KS Number<div className="mt-1 flex gap-2"><input aria-label="Organizer KS number" value={appointKsNumber} disabled={appointLookupState === 'loading' || appointSubmitting} onChange={e => { setAppointKsNumber(e.target.value); setAppointIdentity(null); setAppointLookupState('idle'); }} className="block w-full rounded-xl border border-[#1a1a1a]/15 bg-white p-2" /><button type="button" disabled={!appointKsNumber.trim() || appointLookupState === 'loading' || appointSubmitting} onClick={() => void lookupAppointIdentity()} className="whitespace-nowrap rounded-xl border border-[#1a1a1a]/15 px-3 py-2 text-sm font-medium disabled:opacity-40">{appointLookupState === 'loading' ? 'Looking up…' : 'Look up'}</button></div></label>
          {appointLookupState === 'found' && appointIdentity && <div className="rounded-xl bg-white p-2 text-sm">
            <p className="font-medium text-[#1a1a1a]/80">{appointIdentity.displayName}</p>
            <p className="text-[#1a1a1a]/55">{appointIdentity.canonicalKsNumber} · {appointIdentity.status}</p>
            <label className="mt-2 block text-sm">Role<select aria-label="Organizer role" value={appointRole} disabled={appointSubmitting} onChange={e => setAppointRole(e.target.value as AppointGroupOrganizerRequestBody['organizerRole'])} className="mt-1 block w-full rounded-xl border p-2"><option value="PRIMARY_ORGANIZER">Primary organizer</option><option value="ORGANIZER">Organizer</option><option value="APPROVER">Approver</option><option value="AUDITOR">Auditor</option></select></label>
            <label className="mt-2 block text-sm">Authority<select aria-label="Organizer authority scope" value={appointScope} disabled={appointSubmitting} onChange={e => setAppointScope(e.target.value as AppointGroupOrganizerRequestBody['authorityScope'])} className="mt-1 block w-full rounded-xl border p-2"><option value="MANAGE">Can manage the group</option><option value="APPROVE">Can decide governed-action approvals</option><option value="VIEW">Can view governance detail only</option></select></label>
            <button type="button" disabled={appointSubmitting} onClick={() => void submitAppointOrganizer()} className="mt-3 rounded-xl bg-[#3a7a1f] px-3 py-2 text-sm font-medium text-white disabled:opacity-40">{appointSubmitting ? 'Appointing…' : 'Appoint organizer'}</button>
          </div>}
          {appointError && <p role="alert" className="text-sm text-red-600">{appointError}</p>}
          <button type="button" disabled={appointSubmitting} onClick={() => { setAppointOpen(false); setAppointKsNumber(''); setAppointLookupState('idle'); setAppointIdentity(null); setAppointError(null); }} className="text-xs font-medium text-[#1a1a1a]/50">Close</button>
        </div>}
      </div>}
    </div>
    <section aria-labelledby="group-rules-heading" className="rounded-xl border border-[#1a1a1a]/10 bg-[#fafaf8] p-4">
      <h3 id="group-rules-heading" className="text-sm font-semibold">Group rules</h3>
      {group.governancePolicies.length > 0 ? <ul className="mt-3 space-y-3 text-sm text-[#1a1a1a]/60">{group.governancePolicies.map(p => <li key={p.id}>
        <p className="font-medium text-[#1a1a1a]/75">{governedActionLabel(p.governedActionType)} · {governanceStatusLabel(p.status)}</p>
        <p>Minimum approvals: {p.minimumApprovalCount}{p.quorumPercentage != null ? ` · Quorum term: ${p.quorumPercentage}%` : ''}</p>
        <p>{p.makerCheckerRequired ? 'Requester self-approval is not allowed.' : 'Requester self-approval is not restricted by this policy term.'}{p.rejectionTerminal ? ' A rejection is terminal.' : ''}{p.approvalExpiryHours != null ? ` Approval requests expire after ${p.approvalExpiryHours} hours.` : ''}</p>
        {capabilityState === 'ready' && capabilities?.canManageGovernance === true && p.status === 'DRAFT' && <button type="button" disabled={activatingPolicyId === p.id} onClick={() => void submitActivatePolicy(p.id)} className="mt-1 text-sm font-medium text-[#3a7a1f] disabled:opacity-40">{activatingPolicyId === p.id ? 'Activating rule…' : 'Activate this rule'}</button>}
        {policyActivateError?.policyId === p.id && <p role="alert" className="mt-1 text-sm text-red-600">{policyActivateError.message}</p>}
      </li>)}</ul> : <p className="mt-2 text-sm text-[#1a1a1a]/55">No group rules are included in the backend response.</p>}
      {capabilityState === 'ready' && capabilities?.canManageGovernance === true && <div className="mt-4 border-t border-[#1a1a1a]/10 pt-3">
        {!policyFormOpen ? <button type="button" onClick={() => setPolicyFormOpen(true)} className="text-sm font-medium text-[#3a7a1f]">Add a governance rule</button> : <div className="space-y-2 rounded-xl border border-[#1a1a1a]/10 bg-white p-3">
          <label className="block text-sm">Action this rule governs<select aria-label="Governed action type" value={policyAction} disabled={policySubmitting} onChange={e => setPolicyAction(e.target.value as CreateGovernancePolicyRequestBody['governedActionType'])} className="mt-1 block w-full rounded-xl border p-2">{CREATABLE_GOVERNED_ACTION_TYPES.map(action => <option key={action} value={action}>{governedActionLabel(action)}</option>)}</select></label>
          <label className="block text-sm">Minimum approvals<input aria-label="Minimum approval count" type="number" min={1} value={policyMinApprovals} disabled={policySubmitting} onChange={e => setPolicyMinApprovals(e.target.value)} className="mt-1 block w-full rounded-xl border p-2" /></label>
          <label className="block text-sm">Quorum percentage (optional)<input aria-label="Quorum percentage" type="number" min={0} max={100} value={policyQuorumPct} disabled={policySubmitting} onChange={e => setPolicyQuorumPct(e.target.value)} className="mt-1 block w-full rounded-xl border p-2" /></label>
          <label className="block text-sm">Approval expiry, hours (optional)<input aria-label="Approval expiry hours" type="number" min={1} value={policyExpiryHours} disabled={policySubmitting} onChange={e => setPolicyExpiryHours(e.target.value)} className="mt-1 block w-full rounded-xl border p-2" /></label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={policyMakerChecker} disabled={policySubmitting} onChange={e => setPolicyMakerChecker(e.target.checked)} />Requester cannot approve their own request</label>
          <div>
            <p className="text-sm font-medium">Approvers</p>
            {approvers.length > 0 && <ul className="mt-1 space-y-1 text-sm text-[#1a1a1a]/65">{approvers.map(a => <li key={a.identityId} className="flex items-center justify-between gap-2">{a.displayName} ({a.ksNumber})<button type="button" disabled={policySubmitting} onClick={() => removeApprover(a.identityId)} className="text-xs font-medium text-red-700">Remove</button></li>)}</ul>}
            <div className="mt-2 flex gap-2"><input aria-label="Approver KS number" value={approverKsNumber} disabled={approverLookupState === 'loading' || policySubmitting} onChange={e => setApproverKsNumber(e.target.value)} className="block w-full rounded-xl border border-[#1a1a1a]/15 bg-white p-2" /><button type="button" disabled={!approverKsNumber.trim() || approverLookupState === 'loading' || policySubmitting} onClick={() => void lookupApprover()} className="whitespace-nowrap rounded-xl border border-[#1a1a1a]/15 px-3 py-2 text-sm font-medium disabled:opacity-40">{approverLookupState === 'loading' ? 'Looking up…' : 'Add approver'}</button></div>
            {approverLookupError && <p role="alert" className="mt-1 text-sm text-red-600">{approverLookupError}</p>}
          </div>
          {policyError && <p role="alert" className="text-sm text-red-600">{policyError}</p>}
          <div className="flex flex-col gap-2 sm:flex-row">
            <button type="button" disabled={policySubmitting || !Number.isInteger(Number.parseInt(policyMinApprovals, 10)) || Number.parseInt(policyMinApprovals, 10) < 1 || approvers.length < 1 || Number.parseInt(policyMinApprovals, 10) > approvers.length} onClick={() => void submitCreatePolicy()} className="rounded-xl bg-[#3a7a1f] px-3 py-2 text-sm font-medium text-white disabled:opacity-40">{policySubmitting ? 'Creating…' : 'Create rule'}</button>
            <button type="button" disabled={policySubmitting} onClick={() => { setPolicyFormOpen(false); setPolicyError(null); }} className="rounded-xl border border-[#1a1a1a]/10 px-3 py-2 text-sm font-medium">Close</button>
          </div>
        </div>}
      </div>}
      <div className="mt-4 border-t border-[#1a1a1a]/10 pt-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-[#1a1a1a]/45">What happens next</p>
        {capabilityState === 'loading' && <p className="mt-1 text-sm text-[#1a1a1a]/60">Checking available actions…</p>}
        {capabilityState === 'error' && <div className="mt-1 space-y-2 text-sm text-[#1a1a1a]/60"><p>Actions are unavailable right now.</p><button type="button" onClick={() => void readCapabilities()} className="font-medium text-[#3a7a1f]">Check actions again</button></div>}
        {capabilityState === 'ready' && capabilities && <div className="mt-1 space-y-1 text-sm text-[#1a1a1a]/60">
          {canActivate && <p>You can activate this group. SecurePay will check again when you continue.</p>}
          {!canActivate && group.status === 'DRAFT' && capabilities.activation.blockingReasonCodes.map((code, index) => <p key={`${code}-${index}`}>{activationBlockerLabel(code)}</p>)}
          {capabilities.canManageGovernance && <p>You can manage governance setup.</p>}
          {capabilities.canCreateApprovalRequest && <p>You can propose an authorized governed action.</p>}
          {capabilities.canDecideApproval && <p>You can decide an approval when request details are available. No approval request is discoverable in this view.</p>}
          {group.status === 'ACTIVE' && <p>Approval request details are not yet available in this view.</p>}
          {!canActivate && group.status !== 'DRAFT' && group.status !== 'ACTIVE' && <p>{groupGovernanceNextStep(group.status, group.governancePolicies)}</p>}
        </div>}
      </div>
      <p className="mt-3 text-xs text-[#1a1a1a]/45">These are policy terms, not an approval result. This view does not prove current-user management authority.</p>
      {activationError && <p role="alert" className="mt-3 text-sm text-red-600">{activationError}</p>}
      {canActivate && <button type="button" disabled={activating} onClick={() => void activate()} className="mt-3 rounded-xl bg-[#3a7a1f] px-4 py-2.5 text-sm font-medium text-white disabled:opacity-40">{activating ? 'Activating…' : 'Activate group'}</button>}
      {canCancel && !cancelOpen && <button type="button" onClick={() => { setCancelOpen(true); setCancelError(null); }} className="mt-3 rounded-xl border border-red-200 px-4 py-2.5 text-sm font-medium text-red-700">Cancel group</button>}
      {canCancel && cancelOpen && <div className="mt-3 space-y-3 rounded-xl border border-red-200 bg-red-50/40 p-4">
        <div><p className="text-sm font-medium text-red-800">Cancel this Group SecureLink?</p><p className="mt-1 text-sm text-[#1a1a1a]/60">This closes the group. It does not refund, reverse, release, or move money. Recorded contribution intentions remain records.</p></div>
        <label className="block text-sm">Reason<textarea aria-label="Cancellation reason" aria-describedby={`group-cancellation-reason-help${cancelError ? ' group-cancellation-error' : ''}`} value={cancelReason} disabled={cancelling || submittedCancelReason !== null} onChange={event => setCancelReason(event.target.value)} className="mt-1 block w-full rounded-xl border border-[#1a1a1a]/15 bg-white p-2.5" /></label>
        <p id="group-cancellation-reason-help" className="text-xs text-[#1a1a1a]/50">This interface requires a reason so you can deliberately confirm the cancellation. SecurePay’s API accepts a cancellation without one.</p>
        {submittedCancelReason !== null && !cancelling && <p className="text-xs text-[#1a1a1a]/50">To change the submitted reason, close this cancellation and start a new one.</p>}
        <div className="flex flex-col gap-2 sm:flex-row">
          <button type="button" disabled={cancelling || !cancelReason.trim()} onClick={() => void cancel()} className="rounded-xl bg-red-700 px-4 py-2.5 text-sm font-medium text-white disabled:opacity-40">{cancelling ? 'Cancelling…' : 'Confirm cancellation'}</button>
          <button type="button" disabled={cancelling} onClick={() => { setCancelOpen(false); setCancelReason(''); setSubmittedCancelReason(null); setCancelError(null); cancellationKeyRef.current = crypto.randomUUID(); }} className="rounded-xl border border-[#1a1a1a]/10 px-4 py-2.5 text-sm font-medium">Keep group open</button>
        </div>
      </div>}
      {cancelError && <p id="group-cancellation-error" role="alert" className="mt-3 text-sm text-red-600">{cancelError}</p>}
    </section>
    {capabilityState === 'ready' && capabilities?.canManagePublicLocator === true && <section aria-labelledby="group-share-heading" className="rounded-xl border border-[#1a1a1a]/10 bg-[#fafaf8] p-4">
      <h3 id="group-share-heading" className="text-sm font-semibold">Share this group</h3>
      {group.status !== 'ACTIVE' && locatorState === 'idle' && <p className="mt-2 text-sm text-[#1a1a1a]/55">A share link can be issued once this group is active.</p>}
      {group.status === 'ACTIVE' && locatorState === 'idle' && <div className="mt-2 space-y-2">
        <p className="text-sm text-[#1a1a1a]/60">Issue a public, read-only link contributors can use to view this group’s purpose and contribute.</p>
        <button type="button" onClick={() => void issuePublicLocator()} className="rounded-xl bg-[#3a7a1f] px-3 py-2 text-sm font-medium text-white">Issue share link</button>
      </div>}
      {locatorState === 'issuing' && <p className="mt-2 text-sm text-[#1a1a1a]/55">Issuing share link…</p>}
      {locatorState === 'issued' && issuedLocator && <div className="mt-2 space-y-2">
        <p className="text-sm font-medium text-[#1a1a1a]/80">{`${typeof window !== 'undefined' ? window.location.origin : ''}/group/${issuedLocator.slug}`}</p>
        <p className="text-xs text-[#1a1a1a]/50">This link cannot be shown again from this screen after you leave or refresh. Copy it now.</p>
      </div>}
      {locatorState === 'error' && <div className="mt-2 space-y-2"><p className="text-sm text-[#1a1a1a]/60">{locatorError}</p><button type="button" onClick={() => { setLocatorState('idle'); locatorKeyRef.current = crypto.randomUUID(); }} className="text-sm font-medium text-[#3a7a1f]">Try again</button></div>}
    </section>}
    <div className="grid gap-3 sm:grid-cols-3 text-sm"><div><p className="font-semibold">{safeMoney(group.currency, group.recordedContributionTotalMinor) ?? 'Unavailable'}</p><p className="text-[#1a1a1a]/55">Recorded contribution intentions ({Number.isSafeInteger(group.recordedContributionCount) && group.recordedContributionCount >= 0 ? group.recordedContributionCount : 'Unavailable'})</p></div><div><p className="font-semibold">{safeMoney(group.currency, group.pendingContributionTotalMinor) ?? 'Unavailable'}</p><p className="text-[#1a1a1a]/55">Contribution records with payment intents in flight ({Number.isSafeInteger(group.pendingContributionCount) && group.pendingContributionCount >= 0 ? group.pendingContributionCount : 'Unavailable'})</p></div><div><p className="font-semibold">{safeMoney(group.currency, group.confirmedContributionTotalMinor) ?? 'Unavailable'}</p><p className="text-[#1a1a1a]/55">Intended amounts with backend-confirmed linked payment intents ({Number.isSafeInteger(group.confirmedContributionCount) && group.confirmedContributionCount >= 0 ? group.confirmedContributionCount : 'Unavailable'})</p></div></div>
    <p className="text-xs text-[#1a1a1a]/45">These totals describe contribution records and payment-intent state. They are not a balance, settlement, available funds, or payout authority.</p>
    {capabilityState === 'ready' && (capabilities?.canReadOwnContribution === true || capabilities?.canRecordContributionIntent === true) && <GroupContributionPanel
      agreementId={agreementId} authHeader={authHeader} currency={group.currency}
      groupStatus={group.status} canRead={capabilities.canReadOwnContribution === true}
      canRecord={capabilities.canRecordContributionIntent === true}
    />}
  </div>;
}
