// Sincronizzazione: tutti i dati che contano passano da Google Drive e tornano identici.
// (Il funzionamento generale della sincronizzazione è provato nell'app I miei libri, dove è nato js/sincro/.)
import { test, uguale } from './mini-test.js';
import * as R from '../js/sincro/registro.js';
import { SCHEMA } from '../js/sincronizzazione.js';
import { upgrade } from '../js/migrazione.js';

const DATI = upgrade({ version: 4, lastBackup: '2026-11-01',
  habits: [{ id: 'h1', name: 'Acqua', type: 'qty', target: 2, unit: 'L', step: 0.25, days: [0, 1, 2, 3, 4, 5, 6], created: '2026-10-01', diff: 1 }],
  logs: { '2026-11-20': { h1: 1.5 }, '2026-11-21': { h1: 2 } },
  journal: { '2026-11-21': { mood: 4, note: 'bene', belle: ['a', 'b', 'c'] } },
  settings: { reminder: { on: true, time: '21:00' }, soglia: 0.8, google: { riepilogo: false, calendarId: '', usato: false } },
  obiettivo: { giorni: 21, premio: 'cena', creato: '2026-11-01' },
  traguardi: [{ giorni: 7, premio: 'x', raggiunto: '2026-11-08', pillola: null, visto: true }], gioco: null });

test('sincronizzazione: i dati scomposti e ricomposti tornano identici (tranne il giorno del backup, che è del dispositivo)', () => {
  const r = R.ricostruisci({ version: DATI.version, lastBackup: null }, R.elementi(DATI, SCHEMA), SCHEMA);
  uguale(R.stabile(r), R.stabile({ ...DATI, lastBackup: null }));
});
test('sincronizzazione: ogni parte dei dati è nello schema o è volutamente del dispositivo', () => {
  const coperti = new Set([...SCHEMA.raccolte.map(x => x.percorso), ...SCHEMA.singoli, 'version', 'lastBackup']);
  uguale(Object.keys(DATI).filter(k => !coperti.has(k)), []);
});
