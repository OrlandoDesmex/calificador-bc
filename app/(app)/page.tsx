'use client';

import { useState } from 'react';

// ── Scoring matrix (from Excel) ───────────────────────────────────────────────
const MATRIX: Record<string, Record<string, number>> = {
  'SIN ESPACIO Y/O CAPACIDAD PARA SFV': {
    'SE CUENTA CON CALENTADORES DE AGUA':                2,
    'AGUA CALIENTE GENERADA CON VAPOR E INTERCAMBIADOR': 3,
    'NO SE REQUIERE AGUA CALIENTE, SOLO VAPOR':          1,
    'GAS LP':                                            3,
    'GAS NATURAL':                                       1,
    'TORRE DE ENFRIAMIENTO':                             1,
    'CHILLERS (AGUA HELADA)':                            2,
  },
  'HAY ESPACIO Y/O CAPACIDAD PARA SFV': {
    'SE CUENTA CON CALENTADORES DE AGUA':                3,
    'AGUA CALIENTE GENERADA CON VAPOR E INTERCAMBIADOR': 4,
    'NO SE REQUIERE AGUA CALIENTE, SOLO VAPOR':          1,
    'GAS LP':                                            3,
    'GAS NATURAL':                                       2,
    'TORRE DE ENFRIAMIENTO':                             1,
    'CHILLERS (AGUA HELADA)':                            3,
  },
};

const TIERS = [
  { min: 9,  max: 10, label: 'Alto Potencial', bar: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0', text: '#14532d', desc: 'Condiciones óptimas para una bomba de calor. Alta probabilidad de cierre. Procede a levantamiento técnico.' },
  { min: 7,  max: 8,  label: 'Buen Potencial', bar: '#0d9488', bg: '#f0fdfa', border: '#99f6e4', text: '#134e4a', desc: 'Buenas condiciones para el proyecto. Se recomienda análisis técnico-económico detallado.' },
  { min: 5,  max: 6,  label: 'Potencial Bajo', bar: '#d97706', bg: '#fffbeb', border: '#fde68a', text: '#78350f', desc: 'Condiciones parciales. Requiere análisis más profundo para determinar viabilidad.' },
  { min: 3,  max: 4,  label: 'No Calificado',  bar: '#B71C1C', bg: '#fff5f5', border: '#fecaca', text: '#7f1d1d', desc: 'El proyecto no presenta condiciones favorables para una bomba de calor en este momento.' },
];

type State = {
  sfv:           string | null;
  calentamiento: string | null;
  combustible:   string | null;
  enfriamiento:  string | null;
};

type ProspectInfo = { nombre: string; empresa: string; vendedor: string; fecha: string };

function getScore(state: State, key: keyof Omit<State, 'sfv'>): number | null {
  if (!state.sfv || !state[key]) return null;
  return MATRIX[state.sfv][state[key]!] ?? null;
}

function getTotalScore(state: State): number | null {
  const s1 = getScore(state, 'calentamiento');
  const s2 = getScore(state, 'combustible');
  const s3 = getScore(state, 'enfriamiento');
  if (s1 === null || s2 === null || s3 === null) return null;
  return s1 + s2 + s3;
}

function getTier(score: number) {
  return TIERS.find((t) => score >= t.min && score <= t.max)!;
}

// ── Sub-components ────────────────────────────────────────────────────────────

function OptionCard({
  label, description, selected, onClick,
}: { label: string; description: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`text-left rounded-xl p-4 border-2 transition-all ${
        selected
          ? 'border-desmex-red bg-red-50'
          : 'border-desmex-border hover:border-desmex-red hover:shadow-md'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-slate-700 leading-snug">{label}</div>
          <div className="text-xs text-slate-400 mt-0.5">{description}</div>
        </div>
        <div className={`rounded-full w-5 h-5 flex-shrink-0 flex items-center justify-center mt-0.5 transition-all ${
          selected ? 'bg-desmex-red' : 'border-2 border-desmex-border'
        }`}>
          {selected && (
            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
      </div>
    </button>
  );
}

function QuestionSection({
  number, title, subtitle, children,
}: { number: number; title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <section className="bg-white rounded-2xl shadow-sm p-6 border border-desmex-border">
      <div className="flex items-start gap-3 mb-4">
        <span className="text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5 text-white bg-desmex-red">
          {number}
        </span>
        <div>
          <h2 className="font-semibold text-slate-800 leading-snug">{title}</h2>
          <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function CalificadorPage() {
  const today = new Date().toISOString().split('T')[0];

  const [info, setInfo] = useState<ProspectInfo>({ nombre: '', empresa: '', vendedor: '', fecha: today });
  const [state, setState] = useState<State>({ sfv: null, calentamiento: null, combustible: null, enfriamiento: null });
  const [showResult, setShowResult] = useState(false);

  function select(key: keyof State, val: string) {
    setState((s) => ({ ...s, [key]: val }));
  }

  const answeredCount = Object.values(state).filter(Boolean).length;
  const totalScore    = getTotalScore(state);
  const allDone       = answeredCount === 4;

  function handleReset() {
    setInfo({ nombre: '', empresa: '', vendedor: '', fecha: today });
    setState({ sfv: null, calentamiento: null, combustible: null, enfriamiento: null });
    setShowResult(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <div className="space-y-5 pb-16">

      {/* Prospect info */}
      <section className="bg-white rounded-2xl shadow-sm p-6 border border-desmex-border">
        <h2 className="text-xs font-semibold text-desmex-red uppercase tracking-wider mb-4">
          Información del prospecto
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {([
            ['nombre',   'Nombre del contacto', 'text',  'Ej. Juan Pérez'],
            ['empresa',  'Empresa',              'text',  'Ej. Industrias XYZ S.A.'],
            ['vendedor', 'Vendedor',             'text',  'Tu nombre'],
            ['fecha',    'Fecha',                'date',  ''],
          ] as const).map(([field, label, type, placeholder]) => (
            <div key={field}>
              <label className="block text-xs font-medium text-slate-600 mb-1">{label}</label>
              <input
                type={type}
                value={info[field]}
                placeholder={placeholder}
                onChange={(e) => setInfo((i) => ({ ...i, [field]: e.target.value }))}
                className="w-full rounded-lg border border-desmex-border px-3 py-2 text-sm
                           focus:outline-none focus:ring-2 focus:ring-desmex-red/30 focus:border-desmex-red transition"
              />
            </div>
          ))}
        </div>
      </section>

      {/* Q1: SFV */}
      <QuestionSection
        number={1}
        title="¿Se tiene espacio y capacidad en transformador para Sistema Fotovoltaico (SFV)?"
        subtitle="Evalúa la viabilidad de generación solar complementaria"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <OptionCard
            label="Sin espacio / capacidad para SFV"
            description="No es posible instalar paneles solares"
            selected={state.sfv === 'SIN ESPACIO Y/O CAPACIDAD PARA SFV'}
            onClick={() => select('sfv', 'SIN ESPACIO Y/O CAPACIDAD PARA SFV')}
          />
          <OptionCard
            label="Hay espacio y capacidad para SFV"
            description="Viable instalar generación solar"
            selected={state.sfv === 'HAY ESPACIO Y/O CAPACIDAD PARA SFV'}
            onClick={() => select('sfv', 'HAY ESPACIO Y/O CAPACIDAD PARA SFV')}
          />
        </div>
      </QuestionSection>

      {/* Q2: Calentamiento */}
      <QuestionSection
        number={2}
        title="Escenario de calentamiento actual"
        subtitle="¿Cómo se genera actualmente el agua caliente o vapor?"
      >
        <div className="grid grid-cols-1 gap-3">
          <OptionCard
            label="Se cuenta con calentadores de agua"
            description="Calentadores directos de agua (boilers, calderas de agua)"
            selected={state.calentamiento === 'SE CUENTA CON CALENTADORES DE AGUA'}
            onClick={() => select('calentamiento', 'SE CUENTA CON CALENTADORES DE AGUA')}
          />
          <OptionCard
            label="Agua caliente generada con vapor e intercambiador"
            description="Caldera de vapor + intercambiador de calor"
            selected={state.calentamiento === 'AGUA CALIENTE GENERADA CON VAPOR E INTERCAMBIADOR'}
            onClick={() => select('calentamiento', 'AGUA CALIENTE GENERADA CON VAPOR E INTERCAMBIADOR')}
          />
          <OptionCard
            label="No se requiere agua caliente, solo vapor"
            description="El proceso solo utiliza vapor directo"
            selected={state.calentamiento === 'NO SE REQUIERE AGUA CALIENTE, SOLO VAPOR'}
            onClick={() => select('calentamiento', 'NO SE REQUIERE AGUA CALIENTE, SOLO VAPOR')}
          />
        </div>
      </QuestionSection>

      {/* Q3: Combustible */}
      <QuestionSection
        number={3}
        title="Combustible utilizado actualmente"
        subtitle="¿Con qué combustible opera el sistema de calentamiento?"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <OptionCard
            label="Gas LP"
            description="Gas licuado de petróleo (propano/butano)"
            selected={state.combustible === 'GAS LP'}
            onClick={() => select('combustible', 'GAS LP')}
          />
          <OptionCard
            label="Gas Natural"
            description="Gas natural de red de distribución"
            selected={state.combustible === 'GAS NATURAL'}
            onClick={() => select('combustible', 'GAS NATURAL')}
          />
        </div>
      </QuestionSection>

      {/* Q4: Enfriamiento */}
      <QuestionSection
        number={4}
        title="Escenario de enfriamiento actual"
        subtitle="¿Qué sistema de enfriamiento utiliza el proceso?"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <OptionCard
            label="Torre de enfriamiento"
            description="Sistema de rechazo de calor al ambiente"
            selected={state.enfriamiento === 'TORRE DE ENFRIAMIENTO'}
            onClick={() => select('enfriamiento', 'TORRE DE ENFRIAMIENTO')}
          />
          <OptionCard
            label="Chillers (agua helada)"
            description="Sistema de enfriamiento por compresión / absorción"
            selected={state.enfriamiento === 'CHILLERS (AGUA HELADA)'}
            onClick={() => select('enfriamiento', 'CHILLERS (AGUA HELADA)')}
          />
        </div>
      </QuestionSection>

      {/* Result */}
      {allDone && totalScore !== null && (() => {
        const tier = getTier(totalScore);
        const pct  = Math.round(((totalScore - 3) / 7) * 100);
        const breakdown = [
          { label: 'Calentamiento', key: 'calentamiento' as const, max: state.sfv === 'HAY ESPACIO Y/O CAPACIDAD PARA SFV' ? 4 : 3 },
          { label: 'Combustible',   key: 'combustible'   as const, max: 3 },
          { label: 'Enfriamiento',  key: 'enfriamiento'  as const, max: state.sfv === 'HAY ESPACIO Y/O CAPACIDAD PARA SFV' ? 3 : 2 },
        ];

        return (
          <section className="bg-white rounded-2xl shadow-sm p-6 border border-desmex-border animate-in fade-in slide-in-from-bottom-4 duration-300">
            <h2 className="text-xs font-semibold text-desmex-red uppercase tracking-wider mb-5">
              Resultado de precalificación
            </h2>

            {/* Breakdown bars */}
            <div className="space-y-2 mb-6">
              {breakdown.map(({ label, key, max }) => {
                const s = getScore(state, key)!;
                return (
                  <div key={key} className="flex items-center gap-3">
                    <span className="text-xs text-slate-500 w-28 flex-shrink-0">{label}</span>
                    <div className="flex-1 rounded-full h-2 overflow-hidden bg-desmex-border">
                      <div className="h-2 rounded-full transition-all" style={{ width: `${Math.round((s / max) * 100)}%`, background: tier.bar }} />
                    </div>
                    <span className="text-xs font-semibold text-slate-600 w-8 text-right">{s} pts</span>
                  </div>
                );
              })}
            </div>

            {/* Total score */}
            <div className="rounded-xl p-5 mb-5 bg-desmex-bg border border-desmex-border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-600">Puntaje total</span>
                <span className="text-3xl font-bold text-desmex-red-dark">{totalScore} / 10</span>
              </div>
              <div className="w-full rounded-full h-3 overflow-hidden bg-desmex-border">
                <div className="h-3 rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: tier.bar }} />
              </div>
              <div className="flex justify-between text-xs text-slate-400 mt-1">
                <span>3 (mín)</span>
                <span>10 (máx)</span>
              </div>
            </div>

            {/* Tier badge */}
            <div className="rounded-xl p-4 mb-5" style={{ background: tier.bg, border: `1px solid ${tier.border}` }}>
              <div className="mb-2">
                <span className="text-xs font-bold uppercase tracking-wide px-3 py-1 rounded-full text-white" style={{ background: tier.bar }}>
                  {tier.label}
                </span>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: tier.text }}>{tier.desc}</p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 flex-wrap">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-2 font-medium text-sm px-4 py-2.5 rounded-lg transition
                           bg-desmex-bg border border-desmex-border text-slate-700 hover:bg-desmex-border"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/>
                </svg>
                Imprimir / PDF
              </button>
              <button
                onClick={handleReset}
                className="flex items-center gap-2 text-white font-medium text-sm px-4 py-2.5 rounded-lg transition
                           bg-desmex-red hover:bg-desmex-red-dark"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                </svg>
                Nueva evaluación
              </button>
            </div>
          </section>
        );
      })()}

      {/* Bottom progress bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-desmex-border px-4 py-3 print:hidden z-10">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              {(['sfv', 'calentamiento', 'combustible', 'enfriamiento'] as const).map((k) => (
                <div key={k} className={`w-2 h-2 rounded-full transition-colors ${state[k] ? 'bg-desmex-red' : 'bg-slate-300'}`} />
              ))}
            </div>
            <span className="text-sm text-slate-500">
              {answeredCount < 4
                ? `${4 - answeredCount} pregunta${4 - answeredCount > 1 ? 's' : ''} sin responder`
                : 'Todas las preguntas respondidas'}
            </span>
          </div>
          {totalScore !== null && (
            <span className="text-sm font-semibold text-desmex-red">
              Puntaje: {totalScore}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
