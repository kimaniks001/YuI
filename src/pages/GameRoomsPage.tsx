import { useState } from 'react';
import { Copy, MessageCircle, Radio, ShieldAlert, Users } from 'lucide-react';
import GameNav from '../components/game/GameNav';
import { browserGameService } from '../game/gameService';
import type { GameSnapshot } from '../game/gameTypes';

export default function GameRoomsPage() {
  const [snapshot, setSnapshot] = useState<GameSnapshot>(() => browserGameService.getSnapshot());
  const [roomName, setRoomName] = useState('Friday Night Market');
  const [names, setNames] = useState('You, Wanjiku');
  const [chat, setChat] = useState('');
  const [note, setNote] = useState<string | null>(null);
  const room = snapshot.room;

  const run = (fn: () => GameSnapshot, success?: string) => {
    try { setSnapshot(fn()); setNote(success ?? null); } catch (error) { setNote(error instanceof Error ? error.message : 'Room action could not be completed.'); }
  };

  const create = () => run(() => browserGameService.createRoom(roomName, names.split(',').map(value => value.trim()).filter(Boolean)), 'Local Game room created.');

  return <main className="min-h-screen bg-[#f6f4ed] px-4 py-6 sm:px-6">
    <GameNav />
    <div className="mx-auto max-w-6xl space-y-6">
      <header className="rounded-3xl bg-[#202b3a] p-6 text-white shadow-sm sm:p-8"><p className="text-xs font-bold uppercase tracking-[0.18em] text-sky-200">MW-16 · Multiplayer Rooms</p><h1 className="mt-2 font-display text-3xl sm:text-4xl">A shared Market needs one authoritative room state.</h1><p className="mt-3 max-w-3xl text-sm leading-6 text-white/75">This branch implements the room contract, lobby, readiness, chat and reconnect-shaped state locally. True remote synchronization, anti-cheat and reconnect certification remain a dedicated Game-service responsibility.</p></header>

      <section className="rounded-2xl border border-sky-700/15 bg-sky-50 p-4 text-sm text-sky-950"><div className="flex gap-3"><ShieldAlert size={20} className="mt-0.5 shrink-0" /><div><strong>Remote multiplayer boundary</strong><p className="mt-1 leading-6 text-sky-950/70">The YUI contract is ready, but browser-local storage is not authoritative multiplayer. Do not describe this build as anti-cheat or remotely synchronized until a dedicated Game backend owns room state.</p></div></div></section>

      {!room ? <section className="rounded-2xl border border-ink/8 bg-white p-5 shadow-sm sm:p-6"><p className="text-xs font-bold uppercase tracking-[0.16em] text-green-700">Create a room</p><div className="mt-4 grid gap-3 md:grid-cols-2"><label className="text-sm text-ink/55">Room name<input value={roomName} onChange={event => setRoomName(event.target.value)} className="mt-1 min-h-11 w-full rounded-xl border border-ink/15 px-3 text-ink" /></label><label className="text-sm text-ink/55">Players, comma separated<input value={names} onChange={event => setNames(event.target.value)} className="mt-1 min-h-11 w-full rounded-xl border border-ink/15 px-3 text-ink" /></label></div><button onClick={create} className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-full bg-sky-800 px-5 text-sm font-semibold text-white"><Users size={16} /> Create local room</button><p className="mt-3 text-xs text-ink/40">For 3+ players, the KES 100/hour group-session concept remains visible but no live billing is enabled until the exact payer model is locked.</p></section> : <>
        <section className="rounded-2xl border border-ink/8 bg-white p-5 shadow-sm sm:p-6"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-sky-700">{room.status} · ROUND {room.round}</p><h2 className="mt-1 font-display text-2xl text-ink">{room.name}</h2><button onClick={() => navigator.clipboard?.writeText(room.code)} className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-sky-800"><Copy size={14} /> Room code {room.code}</button></div><div className="rounded-xl bg-[#f7f8f4] px-4 py-3 text-right"><span className="text-xs text-ink/40">SESSION BILLING</span><strong className="mt-1 block text-sm text-ink">{room.groupSessionBillingState === 'PAYER_RULE_UNRESOLVED' ? 'Payer rule unresolved — billing disabled' : 'No live billing in local build'}</strong></div></div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{room.members.map(member => <article key={member.id} className="rounded-xl border border-ink/8 p-3"><div className="flex items-center justify-between gap-2"><strong className="text-sm">{member.name}</strong><span className={`h-2.5 w-2.5 rounded-full ${member.connected ? 'bg-green-600' : 'bg-ink/20'}`} /></div><p className="mt-1 text-xs text-ink/45">{member.id === room.hostId ? 'Host · ' : ''}{member.ready ? 'Ready' : 'Not ready'}</p><button onClick={() => run(() => browserGameService.setRoomReady(member.id, !member.ready))} className="mt-2 text-xs font-semibold text-sky-800">Mark {member.ready ? 'not ready' : 'ready'}</button></article>)}</div>
          <button onClick={() => run(() => browserGameService.startRoom(), 'Local room round started. Remote synchronization is still pending the Game service.')} className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-full bg-sky-800 px-5 text-sm font-semibold text-white"><Radio size={15} /> Start local round</button>
        </section>

        <section className="rounded-2xl border border-ink/8 bg-white p-5 shadow-sm sm:p-6"><div className="flex items-center gap-2 text-sky-800"><MessageCircle size={19} /><p className="text-xs font-bold uppercase tracking-[0.16em]">Room chat contract</p></div><div className="mt-3 max-h-56 space-y-2 overflow-y-auto">{room.chat.length ? room.chat.map(message => { const member = room.members.find(item => item.id === message.memberId); return <article key={message.id} className="rounded-xl bg-[#f7f8f4] p-3 text-sm"><strong>{member?.name ?? 'Player'}</strong><p className="mt-1 text-ink/55">{message.body}</p></article>; }) : <p className="text-sm text-ink/45">No messages yet.</p>}</div><div className="mt-3 flex gap-2"><input value={chat} onChange={event => setChat(event.target.value)} className="min-h-11 min-w-0 flex-1 rounded-xl border border-ink/15 px-3 text-sm" placeholder="Message the room" /><button onClick={() => { if (!chat.trim()) return; run(() => browserGameService.addRoomChat(room.hostId, chat), 'Message added to local room state.'); setChat(''); }} className="rounded-full bg-sky-800 px-4 text-sm font-semibold text-white">Send</button></div></section>
      </>}
      {note && <p className="rounded-xl bg-white p-3 text-sm text-ink/60 shadow-sm">{note}</p>}
    </div>
  </main>;
}
