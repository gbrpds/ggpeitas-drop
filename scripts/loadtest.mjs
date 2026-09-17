// Teste de carga simples sem dependências.
// Uso: node scripts/loadtest.mjs <base> <concorrência> <segundos>
// Ex.: node scripts/loadtest.mjs http://localhost:3000 50 15
const base = process.argv[2] ?? "http://localhost:3000";
const CONC = Number(process.argv[3] ?? 50);
const SECS = Number(process.argv[4] ?? 15);

// rotas públicas representativas do tráfego real
const PATHS = [
  "/",
  "/busca",
  "/busca?cat=brasileirao",
  "/busca?cat=europa",
  "/busca?cat=retro",
  "/busca?q=flamengo",
  "/busca?team=Real%20Madrid",
  "/categoria/brasileirao",
  "/promocao",
  "/blog",
];

const lat = [];
let ok = 0, err = 0, bytes = 0;
const t0 = Date.now();
const deadline = t0 + SECS * 1000;
let started = 0;

function pick() { return PATHS[(started++) % PATHS.length]; }

async function worker() {
  while (Date.now() < deadline) {
    const url = base + pick();
    const s = Date.now();
    try {
      const r = await fetch(url, { headers: { "user-agent": "ggpeitas-loadtest" } });
      const buf = await r.arrayBuffer();
      bytes += buf.byteLength;
      lat.push(Date.now() - s);
      if (r.ok) ok++; else err++;
    } catch {
      err++; lat.push(Date.now() - s);
    }
  }
}

function pct(a, p) { if (!a.length) return 0; const s = [...a].sort((x, y) => x - y); return s[Math.min(s.length - 1, Math.floor(p / 100 * s.length))]; }

const workers = Array.from({ length: CONC }, worker);
await Promise.all(workers);
const secs = (Date.now() - t0) / 1000;
const total = ok + err;
console.log(`\n=== Load test: ${base} ===`);
console.log(`Concorrência: ${CONC} | duração: ${secs.toFixed(1)}s`);
console.log(`Requisições: ${total} | OK: ${ok} | erros: ${err}`);
console.log(`Throughput: ${(total / secs).toFixed(1)} req/s | ${(bytes / 1024 / 1024 / secs).toFixed(2)} MB/s`);
console.log(`Latência (ms): p50=${pct(lat, 50)}  p90=${pct(lat, 90)}  p99=${pct(lat, 99)}  máx=${Math.max(...lat)}`);
