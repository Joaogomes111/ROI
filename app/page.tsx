"use client";

/* eslint-disable @next/next/no-img-element */
import { type CSSProperties, FormEvent, useMemo, useState } from "react";

type Question = {
  id: string;
  type: "score" | "info";
  tag: string;
  text: string;
  sub: string;
  options: string[];
  points: number[];
};

type Answer = {
  optionIndex: number;
  label: string;
  points: number;
};

type LeadForm = {
  nome: string;
  empresa: string;
  email: string;
  whatsapp: string;
  cnpj: string;
  cargo: string;
  consent: boolean;
};

type ResultBand = {
  key: "good" | "warning" | "critical";
  color: string;
  pill: string;
  greeting: string;
  message: string;
  cta: string;
};

declare global {
  interface Window {
    fbq?: (
      command: "track",
      eventName: "Lead",
      params?: Record<string, string | number>,
    ) => void;
  }
}

const CONFIG = {
  firmName: "Roi Contabilidade",
  firmEmail: "comercial@roicontabilidade.com.br",
  whatsappNumber: "554733492772",
};

const QUESTIONS: Question[] = [
  {
    id: "q1",
    type: "score",
    tag: "Perfil de clientes",
    text: "Qual é o principal público que compra da sua empresa?",
    sub: "Considere o faturamento, não a quantidade de clientes.",
    options: [
      "Praticamente só consumidor final (pessoa física)",
      "Maioria pessoa física, com alguns clientes empresas",
      "Mix equilibrado entre pessoa física e empresas",
      "Maioria ou quase só empresas (venda B2B)",
    ],
    points: [0, 2, 4, 6],
  },
  {
    id: "q2",
    type: "score",
    tag: "Perfil de clientes",
    text: "Dos seus clientes que são empresas (CNPJ), qual parcela está fora do Simples Nacional (Lucro Presumido ou Lucro Real)?",
    sub: "Se não vende para empresas, marque a primeira opção.",
    options: [
      "Não sei ou não se aplica",
      "Menos de 30%",
      "Entre 30% e 70%",
      "Mais de 70%",
    ],
    points: [0, 2, 4, 6],
  },
  {
    id: "q3",
    type: "score",
    tag: "Sinais comerciais",
    text: "Algum cliente já perguntou sobre crédito de imposto na nota fiscal ou sobre a tributação da sua empresa antes de fechar negócio?",
    sub: "",
    options: [
      "Não, nunca",
      "Não, mas acho que pode acontecer",
      "Sim, já perguntaram",
      "Sim, e isso já pesou contra nós em alguma negociação",
    ],
    points: [0, 1.5, 3, 4.5],
  },
  {
    id: "q4",
    type: "score",
    tag: "Setor de atuação",
    text: "Qual frase melhor descreve o setor da sua empresa?",
    sub: "",
    options: [
      "Serviços voltados à pessoa física (ex: saúde, beleza, educação, autônomos)",
      "Comércio varejista",
      "Serviços B2B (consultoria, TI, terceirização, serviços técnicos)",
      "Indústria ou comércio atacadista",
    ],
    points: [0, 1, 2, 3],
  },
  {
    id: "q5",
    type: "info",
    tag: "Enquadramento",
    text: "Em qual Anexo do Simples Nacional sua empresa está enquadrada hoje?",
    sub: "Se não tiver certeza, pergunte ao seu contador ou marque 'não sei'.",
    options: [
      "Anexo I (comércio)",
      "Anexo II (indústria)",
      "Anexo III (serviços em geral)",
      "Anexo IV ou V (serviços com mão de obra intensiva/técnica)",
      "Não sei",
    ],
    points: [0, 0, 0, 0, 0],
  },
  {
    id: "q6",
    type: "score",
    tag: "Porte",
    text: "Qual o faturamento anual aproximado da empresa?",
    sub: "",
    options: [
      "Até R$ 360 mil",
      "De R$ 360 mil a R$ 1,8 milhão",
      "De R$ 1,8 milhão a R$ 3,6 milhões",
      "Acima de R$ 3,6 milhões",
    ],
    points: [0, 1, 2, 3],
  },
  {
    id: "q7",
    type: "score",
    tag: "Crescimento",
    text: "Existe chance real de a empresa ultrapassar o limite do Simples Nacional (R$ 4,8 milhões) nos próximos 2 a 3 anos?",
    sub: "",
    options: [
      "Não, estamos longe disso",
      "Talvez, estamos em crescimento",
      "Sim, é bem provável",
    ],
    points: [0, 2, 3],
  },
  {
    id: "q8",
    type: "score",
    tag: "Cadeia de fornecimento",
    text: "Que parte das suas compras (mercadorias ou insumos) vem de fornecedores que NÃO são do Simples Nacional?",
    sub: "",
    options: [
      "Pouca ou nenhuma",
      "Uma parte relevante",
      "A maior parte das compras",
    ],
    points: [0, 0.5, 1],
  },
  {
    id: "q9",
    type: "score",
    tag: "Margem e preço",
    text: "Como está a margem de lucro da empresa hoje?",
    sub: "Pense na capacidade de absorver pressão de preço da concorrência.",
    options: [
      "Confortável, temos espaço de negociação",
      "Apertada, mas conseguimos nos ajustar",
      "No limite — qualquer perda de contrato pesa muito",
    ],
    points: [0, 2, 3],
  },
  {
    id: "q10",
    type: "score",
    tag: "Sinais comerciais",
    text: "A empresa já perdeu ou sentiu risco real de perder um contrato por não conseguir repassar crédito tributário integral ao cliente?",
    sub: "",
    options: [
      "Não",
      "Não, mas é uma preocupação real",
      "Sim, já aconteceu ou está em risco",
    ],
    points: [0, 1.5, 4.5],
  },
  {
    id: "q11",
    type: "info",
    tag: "Estrutura interna",
    text: "Sua empresa (ou seu escritório de contabilidade) já está preparada para apurar tributos separadamente do DAS, caso necessário?",
    sub: "",
    options: [
      "Não temos essa estrutura hoje",
      "Parcialmente, precisaríamos de ajustes",
      "Sim, já temos experiência com apuração fora do Simples",
    ],
    points: [0, 0, 0],
  },
  {
    id: "q12",
    type: "info",
    tag: "Conhecimento do tema",
    text: "Antes deste diagnóstico, você já conhecia o conceito de 'Simples Nacional Híbrido'?",
    sub: "",
    options: [
      "Não, é a primeira vez que ouço falar",
      "Já ouvi falar, mas não entendo bem",
      "Sim, já estudei ou conversei sobre o tema",
    ],
    points: [0, 0, 0],
  },
  {
    id: "q13",
    type: "info",
    tag: "Urgência",
    text: "Qual o nível de urgência que você sente em entender esse assunto agora?",
    sub: "",
    options: [
      "Baixa — é mais curiosidade",
      "Média — pretendo entender melhor nos próximos meses",
      "Alta — preciso decidir isso o quanto antes",
    ],
    points: [0, 0, 0],
  },
];

const MAX_SCORE = QUESTIONS.filter((question) => question.type === "score").reduce(
  (sum, question) => sum + Math.max(...question.points),
  0,
);

const initialLeadForm: LeadForm = {
  nome: "",
  empresa: "",
  email: "",
  whatsapp: "",
  cnpj: "",
  cargo: "",
  consent: false,
};

function getRawScore(answers: Record<string, Answer>) {
  return QUESTIONS.reduce((total, question) => {
    if (question.type !== "score") return total;
    return total + (answers[question.id]?.points ?? 0);
  }, 0);
}

function computeScore(answers: Record<string, Answer>) {
  return Math.round((getRawScore(answers) / MAX_SCORE) * 100);
}

function getBand(pct: number): ResultBand {
  if (pct < 34) {
    return {
      key: "good",
      color: "#12A66A",
      pill: "Baixo indício de necessidade agora",
      greeting: "Por ora, o Simples tradicional parece adequado",
      cta: "Confirmar com um especialista",
      message:
        "Com base nas suas respostas, sua empresa hoje tem um perfil mais voltado a consumidor final e/ou clientes que não dependem de crédito de IBS/CBS. Isso sugere que, neste momento, permanecer no Simples Nacional tradicional tende a ser a opção mais simples e vantajosa. Como a reforma tributária ainda está em implementação gradual até 2033, vale reavaliar esse cenário periodicamente — principalmente se o perfil de clientes ou o faturamento mudarem.",
    };
  }

  if (pct < 67) {
    return {
      key: "warning",
      color: "#D99A22",
      pill: "Vale uma análise mais próxima",
      greeting: "Existem sinais que merecem atenção",
      cta: "Agendar uma análise",
      message:
        "Suas respostas indicam uma combinação de fatores — como parte das vendas para empresas, proximidade de limites de faturamento ou dependência de fornecedores fora do Simples — que podem tornar o regime híbrido relevante em algum momento. Ainda não é possível afirmar que a migração é necessária agora, mas recomendamos uma análise personalizada para simular o impacto real no seu caixa e nos seus contratos.",
    };
  }

  return {
    key: "critical",
    color: "#CE3F4B",
    pill: "Análise recomendada com prioridade",
    greeting: "Este é um assunto que merece sua atenção agora",
    cta: "Falar com a ROI agora",
    message:
      "O perfil da sua empresa — fortemente baseado em vendas para outras empresas, com clientes fora do Simples Nacional e/ou sinais concretos de pressão comercial relacionada a impostos — indica que o regime de apuração híbrido pode trazer ganho real de competitividade, ou até evitar perda de contratos e margem. Recomendamos conversar com nossa equipe o quanto antes para simular os números da sua empresa.",
  };
}

function buildFactors(answers: Record<string, Answer>) {
  const factors: string[] = [];

  if (answers.q1 && answers.q1.optionIndex >= 2) {
    factors.push("Boa parte (ou a maioria) das suas vendas é para outras empresas (B2B).");
  }
  if (answers.q2 && answers.q2.optionIndex >= 2) {
    factors.push(
      "Parcela relevante dos seus clientes-empresa está fora do Simples Nacional — são justamente os que mais se beneficiam de crédito integral de IBS/CBS.",
    );
  }
  if (answers.q3 && answers.q3.optionIndex >= 2) {
    factors.push("Já existe sinal comercial concreto: clientes perguntando sobre crédito tributário ou tributação.");
  }
  if (answers.q6 && answers.q6.optionIndex >= 2) {
    factors.push("O faturamento já está em faixa mais alta dentro do Simples, o que aumenta a relevância do tema.");
  }
  if (answers.q7 && answers.q7.optionIndex >= 1) {
    factors.push("Há perspectiva de crescimento que pode levar a empresa a sair do Simples nos próximos anos.");
  }
  if (answers.q9 && answers.q9.optionIndex >= 1) {
    factors.push("A margem de lucro atual deixa pouca gordura para absorver perda de competitividade.");
  }
  if (answers.q10 && answers.q10.optionIndex >= 1) {
    factors.push("Já houve (ou há risco real de) perda de negócio ligada a esse tema.");
  }
  if (answers.q11 && answers.q11.optionIndex === 0) {
    factors.push(
      "A estrutura fiscal/contábil atual ainda não está preparada para uma eventual apuração fora do DAS — isso deve ser planejado com antecedência.",
    );
  }

  if (factors.length === 0) {
    factors.push(
      "Seu perfil atual não concentra os fatores de maior impacto (venda B2B relevante para empresas fora do Simples, pressão comercial ou proximidade de limites).",
    );
  }

  return factors;
}

function getLeadErrors(form: LeadForm) {
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim());
  const whatsappOk = form.whatsapp.replace(/\D/g, "").length >= 10;

  return {
    nome: form.nome.trim().length > 1 ? "" : "Informe seu nome.",
    empresa: form.empresa.trim().length > 1 ? "" : "Informe o nome da empresa.",
    email: emailOk ? "" : "Informe um e-mail válido.",
    whatsapp: whatsappOk ? "" : "Informe um WhatsApp válido.",
    consent: form.consent ? "" : "Confirme a autorização para receber o diagnóstico.",
  };
}

function getTrackingData() {
  if (typeof window === "undefined") return {};

  const params = new URLSearchParams(window.location.search);

  return {
    page_url: window.location.href,
    referrer: document.referrer || "",
    utm_source: params.get("utm_source") || "",
    utm_medium: params.get("utm_medium") || "",
    utm_campaign: params.get("utm_campaign") || "",
    utm_content: params.get("utm_content") || "",
    utm_term: params.get("utm_term") || "",
  };
}

async function persistLead(payload: unknown) {
  try {
    const stored = JSON.parse(localStorage.getItem("roi_diagnostico_leads") || "[]");
    stored.push(payload);
    localStorage.setItem("roi_diagnostico_leads", JSON.stringify(stored.slice(-50)));
  } catch {
    // Local fallback is best-effort only.
  }

  try {
    const response = await fetch("/api/leads", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Lead API returned ${response.status}`);
    }
  } catch (error) {
    console.warn("Lead could not be sent to the configured destinations.", error);
  }
}

function trackMetaLead(scorePct: number, band: ResultBand) {
  if (typeof window === "undefined" || typeof window.fbq !== "function") return;

  window.fbq("track", "Lead", {
    content_category: "diagnostico-tributario",
    content_name: "Diagnostico Simples Nacional Hibrido",
    diagnostic_percentage: scorePct,
    diagnostic_result: band.key,
  });
}

export default function Home() {
  const [phase, setPhase] = useState<"intro" | "quiz" | "lead" | "result">("intro");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, Answer>>({});
  const [leadForm, setLeadForm] = useState<LeadForm>(initialLeadForm);
  const [leadData, setLeadData] = useState<LeadForm | null>(null);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentQuestion = QUESTIONS[currentIndex];
  const leadErrors = useMemo(() => getLeadErrors(leadForm), [leadForm]);
  const scorePct = computeScore(answers);
  const rawScore = getRawScore(answers);
  const band = getBand(scorePct);
  const factors = buildFactors(answers);
  const progress =
    phase === "intro"
      ? 0
      : phase === "quiz"
        ? Math.round(((currentIndex + 1) / QUESTIONS.length) * 100)
        : 100;

  const resultLead = leadData ?? leadForm;
  const firstName = resultLead.nome.trim().split(" ")[0] || "sua empresa";
  const dialStyle = {
    "--score-angle": `${scorePct * 3.6}deg`,
    "--status-color": band.color,
  } as CSSProperties;

  const whatsappLink = useMemo(() => {
    const text = encodeURIComponent(
      `Olá! Fiz o diagnóstico de Simples Nacional Híbrido no site da Roi Contabilidade.\n\n` +
        `Nome: ${resultLead.nome}\n` +
        `Empresa: ${resultLead.empresa}\n` +
        `Resultado: ${scorePct}% (${band.pill})\n\n` +
        `Gostaria de entender melhor o que isso significa para minha empresa.`,
    );

    return `https://wa.me/${CONFIG.whatsappNumber}?text=${text}`;
  }, [band.pill, resultLead.empresa, resultLead.nome, scorePct]);

  function scrollToDiagnostic() {
    window.setTimeout(() => {
      document.getElementById("diagnostico")?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }, 30);
  }

  function startQuiz() {
    setPhase("quiz");
    setCurrentIndex(0);
    scrollToDiagnostic();
  }

  function selectOption(optionIndex: number) {
    setAnswers((previous) => ({
      ...previous,
      [currentQuestion.id]: {
        optionIndex,
        label: currentQuestion.options[optionIndex],
        points: currentQuestion.points[optionIndex],
      },
    }));
  }

  function nextQuestion() {
    if (!answers[currentQuestion.id]) return;

    if (currentIndex < QUESTIONS.length - 1) {
      setCurrentIndex((index) => index + 1);
      return;
    }

    setPhase("lead");
  }

  function previousQuestion() {
    if (currentIndex > 0) {
      setCurrentIndex((index) => index - 1);
      return;
    }

    setPhase("intro");
  }

  async function submitLead(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setTouched({
      nome: true,
      empresa: true,
      email: true,
      whatsapp: true,
      consent: true,
    });

    if (Object.values(leadErrors).some(Boolean)) return;

    const payload = {
      created_at: new Date().toISOString(),
      lead: {
        nome: leadForm.nome.trim(),
        empresa: leadForm.empresa.trim(),
        email: leadForm.email.trim(),
        whatsapp: leadForm.whatsapp.trim(),
        cnpj: leadForm.cnpj.trim(),
        cargo: leadForm.cargo.trim(),
      },
      diagnostic: {
        percentage: scorePct,
        raw_score: rawScore,
        max_score: MAX_SCORE,
        band: band.pill,
        factors,
      },
      answers: QUESTIONS.map((question) => ({
        id: question.id,
        tag: question.tag,
        type: question.type,
        question: question.text,
        answer: answers[question.id]?.label || "",
        points: answers[question.id]?.points ?? 0,
      })),
      tracking: getTrackingData(),
    };

    setIsSubmitting(true);
    try {
      await persistLead(payload);
      trackMetaLead(scorePct, band);
      setLeadData(leadForm);
      setPhase("result");
      scrollToDiagnostic();
    } finally {
      setIsSubmitting(false);
    }
  }

  function resetDiagnostic() {
    setPhase("intro");
    setCurrentIndex(0);
    setAnswers({});
    setLeadData(null);
    setLeadForm(initialLeadForm);
    setTouched({});
    scrollToDiagnostic();
  }

  function renderIntro() {
    return (
      <div className="panelContent revealIn">
        <div className="panelKicker">Diagnóstico tributário</div>
        <h2>Descubra se o Simples Nacional Híbrido deve entrar no seu radar.</h2>
        <p>
          Responda às perguntas e receba um diagnóstico inicial com base no perfil
          comercial, faturamento, clientes CNPJ e sinais de pressão por crédito
          tributário.
        </p>
        <div className="panelMeta" aria-label="Informações do diagnóstico">
          <span>13 perguntas</span>
          <span>3 minutos</span>
          <span>Resultado imediato</span>
        </div>
        <button className="primaryButton" type="button" onClick={startQuiz}>
          Iniciar diagnóstico
        </button>
      </div>
    );
  }

  function renderQuiz() {
    const selectedAnswer = answers[currentQuestion.id];

    return (
      <div className="panelContent revealIn">
        <div className="questionTopline">
          <span>{currentQuestion.tag}</span>
          <span>
            Pergunta {currentIndex + 1} de {QUESTIONS.length}
          </span>
        </div>
        <h2>{currentQuestion.text}</h2>
        {currentQuestion.sub ? <p className="questionSub">{currentQuestion.sub}</p> : null}

        <div className="optionsGroup" role="listbox" aria-label={currentQuestion.text}>
          {currentQuestion.options.map((option, optionIndex) => {
            const selected = selectedAnswer?.optionIndex === optionIndex;

            return (
              <button
                aria-pressed={selected}
                className={`optionButton${selected ? " selected" : ""}`}
                key={option}
                onClick={() => selectOption(optionIndex)}
                type="button"
              >
                <span className="optionMarker" aria-hidden="true" />
                <span>{option}</span>
              </button>
            );
          })}
        </div>

        <div className="panelActions">
          <button className="secondaryButton" type="button" onClick={previousQuestion}>
            Voltar
          </button>
          <button
            className="primaryButton"
            disabled={!selectedAnswer}
            type="button"
            onClick={nextQuestion}
          >
            {currentIndex === QUESTIONS.length - 1 ? "Ver resultado" : "Continuar"}
          </button>
        </div>
      </div>
    );
  }

  function renderLeadForm() {
    return (
      <form className="panelContent revealIn" onSubmit={submitLead} noValidate>
        <div className="panelKicker">Resultado pronto</div>
        <h2>Informe seus dados para receber o diagnóstico completo.</h2>
        <p>
          A ROI pode usar essas informações para direcionar a análise e continuar a
          conversa com mais contexto.
        </p>

        <div className="formGrid">
          <label className={touched.nome && leadErrors.nome ? "invalid" : ""}>
            <span>Nome completo</span>
            <input
              autoComplete="name"
              onBlur={() => setTouched((value) => ({ ...value, nome: true }))}
              onChange={(event) => setLeadForm((form) => ({ ...form, nome: event.target.value }))}
              placeholder="Seu nome"
              type="text"
              value={leadForm.nome}
            />
            {touched.nome && leadErrors.nome ? <small>{leadErrors.nome}</small> : null}
          </label>

          <label className={touched.empresa && leadErrors.empresa ? "invalid" : ""}>
            <span>Nome da empresa</span>
            <input
              autoComplete="organization"
              onBlur={() => setTouched((value) => ({ ...value, empresa: true }))}
              onChange={(event) =>
                setLeadForm((form) => ({ ...form, empresa: event.target.value }))
              }
              placeholder="Nome da empresa"
              type="text"
              value={leadForm.empresa}
            />
            {touched.empresa && leadErrors.empresa ? <small>{leadErrors.empresa}</small> : null}
          </label>

          <label className={touched.email && leadErrors.email ? "invalid" : ""}>
            <span>E-mail profissional</span>
            <input
              autoComplete="email"
              onBlur={() => setTouched((value) => ({ ...value, email: true }))}
              onChange={(event) => setLeadForm((form) => ({ ...form, email: event.target.value }))}
              placeholder="voce@empresa.com.br"
              type="email"
              value={leadForm.email}
            />
            {touched.email && leadErrors.email ? <small>{leadErrors.email}</small> : null}
          </label>

          <label className={touched.whatsapp && leadErrors.whatsapp ? "invalid" : ""}>
            <span>WhatsApp com DDD</span>
            <input
              autoComplete="tel"
              onBlur={() => setTouched((value) => ({ ...value, whatsapp: true }))}
              onChange={(event) =>
                setLeadForm((form) => ({ ...form, whatsapp: event.target.value }))
              }
              placeholder="(47) 99999-9999"
              type="tel"
              value={leadForm.whatsapp}
            />
            {touched.whatsapp && leadErrors.whatsapp ? (
              <small>{leadErrors.whatsapp}</small>
            ) : null}
          </label>

          <label>
            <span>CNPJ</span>
            <input
              autoComplete="off"
              onChange={(event) => setLeadForm((form) => ({ ...form, cnpj: event.target.value }))}
              placeholder="Opcional"
              type="text"
              value={leadForm.cnpj}
            />
          </label>

          <label>
            <span>Cargo ou função</span>
            <input
              autoComplete="organization-title"
              onChange={(event) => setLeadForm((form) => ({ ...form, cargo: event.target.value }))}
              placeholder="Opcional"
              type="text"
              value={leadForm.cargo}
            />
          </label>
        </div>

        <label className={`consentLine${touched.consent && leadErrors.consent ? " invalid" : ""}`}>
          <input
            checked={leadForm.consent}
            onBlur={() => setTouched((value) => ({ ...value, consent: true }))}
            onChange={(event) =>
              setLeadForm((form) => ({ ...form, consent: event.target.checked }))
            }
            type="checkbox"
          />
          <span>
            Autorizo a ROI Contabilidade a registrar minhas respostas e entrar em
            contato sobre este diagnóstico.
          </span>
        </label>
        {touched.consent && leadErrors.consent ? (
          <small className="consentError">{leadErrors.consent}</small>
        ) : null}

        <div className="panelActions">
          <button className="secondaryButton" type="button" onClick={() => setPhase("quiz")}>
            Revisar respostas
          </button>
          <button className="primaryButton" disabled={isSubmitting} type="submit">
            {isSubmitting ? "Preparando..." : "Ver meu resultado"}
          </button>
        </div>
      </form>
    );
  }

  function renderResult() {
    return (
      <div className="panelContent revealIn resultContent">
        <div className="resultHeader">
          <div className="scoreDial" style={dialStyle}>
            <div>
              <strong>{scorePct}%</strong>
              <span>indicador</span>
            </div>
          </div>
          <div>
            <span className={`statusPill ${band.key}`}>{band.pill}</span>
            <h2>{band.greeting}</h2>
            <p>
              Diagnóstico preparado para {firstName} · {resultLead.empresa}
            </p>
          </div>
        </div>

        <p className="resultMessage">{band.message}</p>

        <div className="resultBlock">
          <h3>O que observamos no seu diagnóstico</h3>
          <ul>
            {factors.map((factor) => (
              <li key={factor}>{factor}</li>
            ))}
          </ul>
        </div>

        <p className="legalNote">
          Este diagnóstico é um ponto de partida educativo. A confirmação de qual
          regime é mais vantajoso depende de análise personalizada, considerando os
          dados reais de faturamento, compras, contratos e obrigações fiscais.
        </p>

        <div className="panelActions resultActions">
          <a
            className="primaryButton whatsappButton"
            href={whatsappLink}
            rel="noreferrer"
            target="_blank"
          >
            {band.cta}
          </a>
          <button className="secondaryButton" type="button" onClick={resetDiagnostic}>
            Refazer diagnóstico
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="siteShell">
      <div className="topStrip">
        <span>ROI Contabilidade em Itajaí - SC</span>
        <span>comercial@roicontabilidade.com.br · (47) 3349-2772</span>
      </div>

      <header className="siteHeader">
        <a aria-label="ROI Contabilidade" className="brandLogo" href="https://roicontabilidade.com.br/">
          <img alt="ROI Contabilidade" src="/logo-roi.jpg" />
        </a>
        <nav aria-label="Navegação principal">
          <a href="#diagnostico">Diagnóstico</a>
          <a href="#contexto">Contexto</a>
          <a href="#proximos-passos">Próximos passos</a>
        </nav>
        <button className="headerButton" type="button" onClick={startQuiz}>
          Iniciar
        </button>
      </header>

      <section className="heroSection">
        <div className="heroCopy">
          <span className="eyebrow">Simples Nacional Híbrido</span>
          <h1>
            Diagnóstico: sua empresa precisa aderir ao{" "}
            <span>Simples Nacional Híbrido?</span>
          </h1>
          <p>
            A reforma tributária pode mudar a competitividade de empresas do
            Simples que vendem para outros CNPJs. Em poucos minutos, entenda se
            esse tema merece atenção agora.
          </p>

          <div className="heroActions">
            <button className="primaryButton" type="button" onClick={startQuiz}>
              Começar agora
            </button>
            <a className="textButton" href="#contexto">
              Entender o tema
            </a>
          </div>

          <div className="proofLine" aria-label="Credenciais da ROI">
            <span>+350 clientes na carteira</span>
            <span>+40 anos de experiência</span>
            <span>Gestão fiscal e tributária</span>
          </div>
        </div>

        <aside className="diagnosticCard" id="diagnostico">
          <div className="cardChrome">
            <div>
              <span>{phase === "result" ? "Resultado" : "Diagnóstico"}</span>
              <strong>{progress}%</strong>
            </div>
            <div className="progressTrack" aria-hidden="true">
              <div style={{ width: `${progress}%` }} />
            </div>
          </div>

          {phase === "intro" ? renderIntro() : null}
          {phase === "quiz" ? renderQuiz() : null}
          {phase === "lead" ? renderLeadForm() : null}
          {phase === "result" ? renderResult() : null}
        </aside>
      </section>

      <section className="contextSection" id="contexto">
        <div className="sectionIntro">
          <span className="eyebrow">Por que isso importa</span>
          <h2>A decisão não é só tributária. Ela pode afetar preço, crédito e negociação.</h2>
        </div>
        <div className="contextGrid">
          <article>
            <span className="contextIcon clientIcon" aria-hidden="true" />
            <h3>Cliente CNPJ</h3>
            <p>
              Empresas fora do Simples tendem a observar com mais atenção o crédito
              de IBS/CBS nas compras, especialmente em negociações recorrentes.
            </p>
          </article>
          <article>
            <span className="contextIcon competitiveIcon" aria-hidden="true" />
            <h3>Competitividade</h3>
            <p>
              Quando o cliente compara fornecedores, a possibilidade de crédito pode
              influenciar preço líquido, margem e permanência em contratos.
            </p>
          </article>
          <article>
            <span className="contextIcon simulationIcon" aria-hidden="true" />
            <h3>Simulação real</h3>
            <p>
              O diagnóstico indica sinais iniciais. A decisão pede simulação com
              faturamento, compras, anexos, contratos e estrutura contábil.
            </p>
          </article>
        </div>
      </section>

      <section className="nextStepsSection" id="proximos-passos">
        <div>
          <span className="eyebrow">Próximos passos</span>
          <h2>Depois do diagnóstico, a ROI consegue aprofundar a análise com dados reais.</h2>
        </div>
        <ul className="stepList">
          <li>
            <span className="stepIcon profileIcon" aria-hidden="true" />
            <span>Revisar perfil de clientes e concentração B2B.</span>
          </li>
          <li>
            <span className="stepIcon calculatorIcon" aria-hidden="true" />
            <span>Simular impacto de crédito de IBS/CBS nas principais operações.</span>
          </li>
          <li>
            <span className="stepIcon compareIcon" aria-hidden="true" />
            <span>Comparar cenário atual com eventual apuração híbrida.</span>
          </li>
        </ul>
      </section>

      <footer className="siteFooter">
        <img alt="ROI Contabilidade" src="/logo-roi.jpg" />
        <p>
          As regras da reforma tributária estão em implementação gradual. Este
          diagnóstico tem caráter educativo e não substitui uma análise tributária
          individualizada.
        </p>
      </footer>
    </main>
  );
}
