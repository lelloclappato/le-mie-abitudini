// La sincronizzazione di questa app tra telefono e computer, tramite il tuo Google Drive.
// Il funzionamento (uguale in tutte le mie app) è in js/sincro/; qui c'è solo quello che riguarda Abitudini:
// quali dati si sincronizzano e cosa chiedere la prima volta.
import { data, setData, isValid, quandoSalva } from './dati.js';
import { upgrade } from './migrazione.js';
import { creaSincro, conta } from './sincro/sincro.js';

// L'"ID client OAuth" del progetto Google Cloud "Le mie app" (pubblico: identifica l'app, non dà accesso a niente).
// Vuoto = niente sincronizzazione: l'app funziona come prima, solo sul dispositivo.
export const GOOGLE_CLIENT_ID = '';

// Cosa si sincronizza. Resta solo su questo dispositivo: il giorno dell'ultimo backup.
// I giorni segnati (logs) e il diario si uniscono giorno per giorno: se lo stesso giorno lo modifichi
// su due dispositivi senza connessione, vince la modifica fatta per ultima.
export const SCHEMA = {
  raccolte: [
    { percorso: 'habits', chiave: h => h.id },
    { percorso: 'logs', mappa: true },
    { percorso: 'journal', mappa: true },
    { percorso: 'traguardi', chiave: t => `${t.giorni}-${t.raggiunto}` }
  ],
  singoli: ['settings', 'obiettivo', 'gioco']
};

let ridisegna = () => {};
export function quandoArrivanoDati(fn) { ridisegna = fn; }

const plurale = (n, uno, tanti) => `${n} ${n === 1 ? uno : tanti}`;
function descrivi(p) {
  const n = conta(p);
  return [plurale(n.habits || 0, 'abitudine', 'abitudini'), n.logs ? plurale(n.logs, 'giorno segnato', 'giorni segnati') : ''].filter(Boolean).join(' e ');
}

export const sincro = creaSincro({
  prefisso: 'abitudini',
  nomeFile: 'abitudini.json',
  schema: SCHEMA,
  clientId: GOOGLE_CLIENT_ID,
  leggiDati: () => data,
  scriviDati: nuovi => { if (isValid(nuovi)) { setData(upgrade(nuovi)); ridisegna(); } },
  descrivi,
  // la prima volta che questo dispositivo si collega, se qui e sull'account ci sono dati diversi
  // (succede anche solo con le tre abitudini di esempio di un'app appena installata)
  chiediPrimaUnione: async ({ qui, account }) => {
    if (confirm(`Sul tuo account ci sono già dei dati: ${account}. Su questo dispositivo: ${qui}.\n\nVuoi UNIRLI (tenere tutti e due)?`)) return 'unisci';
    if (confirm('Allora vuoi usare SOLO quelli dell’account? Quelli di questo dispositivo verranno sostituiti.\n\n(Annulla = non collegare per ora)')) return 'account';
    return 'annulla';
  }
});

quandoSalva(() => sincro.dopoSalvataggio());
