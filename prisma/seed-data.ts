/**
 * DADOS DE DEMONSTRAÇÃO — ILUSTRATIVOS.
 * Destinos são lugares reais, mas TODOS os valores, notas e condições são estimativas
 * fictícias criadas para demonstrar a interface. Oportunidades são totalmente fictícias.
 * Nada aqui representa preço, disponibilidade ou oferta reais.
 */
import type { Category, Region } from "../src/domain/types";

export const DEMO_SOURCE =
  "Estimativa ilustrativa NomadFree — dados de demonstração, não verificados";

export interface DestinationSeed {
  slug: string;
  name: string;
  country: string;
  region: Region;
  categories: Category[];
  summary: string;
  description: string;
  /** reais por dia (convertido para centavos no seed) */
  dailyBudgetReais: number;
  remoteWorkScore: number;
  internetNotes: string;
  coworkingNotes: string;
  bestSeason: string;
  imageKey: string;
}

export interface OpportunitySeed {
  slug: string;
  title: string;
  category: Extract<Category, "ACCOMMODATION_EXCHANGE" | "VOLUNTEERING">;
  destinationSlug: string;
  summary: string;
  conditions: string;
  hoursPerWeek: number;
  dailyCostReais: number;
  upfrontFeeReais?: number;
  externalUrl?: string;
  imageKey: string;
}

export const destinations: DestinationSeed[] = [
  {
    slug: "medellin-colombia",
    name: "Medellín",
    country: "Colômbia",
    region: "SOUTH_AMERICA",
    categories: ["REMOTE_FRIENDLY", "BUDGET_DESTINATION"],
    summary: "Clima ameno o ano todo, bairros com cafés e coworkings e custo diário moderado.",
    description:
      "Cidade de vale cercada por montanhas, com metrô, teleférico e uma cena grande de trabalhadores remotos. Os valores desta página são estimativas de demonstração e podem diferir muito da realidade.",
    dailyBudgetReais: 260,
    remoteWorkScore: 5,
    internetNotes:
      "Ilustrativo: fibra comum em apartamentos e coworkings; confirme com o anfitrião.",
    coworkingNotes: "Ilustrativo: vários espaços em bairros centrais; planos diários e mensais.",
    bestSeason: "Dezembro a março e junho a agosto (menos chuva)",
    imageKey: "medellin-colombia",
  },
  {
    slug: "cusco-peru",
    name: "Cusco",
    country: "Peru",
    region: "SOUTH_AMERICA",
    categories: ["BUDGET_DESTINATION"],
    summary: "Base andina para quem quer custo baixo, caminhadas e estadias longas.",
    description:
      "Cidade histórica em altitude elevada. Boa para orçamento enxuto, mas exige aclimatação. Valores e condições são ilustrativos.",
    dailyBudgetReais: 190,
    remoteWorkScore: 3,
    internetNotes: "Ilustrativo: conexão varia bastante entre bairros e acomodações.",
    coworkingNotes: "Ilustrativo: poucos espaços; cafés com Wi-Fi são comuns no centro.",
    bestSeason: "Maio a setembro (estação seca)",
    imageKey: "cusco-peru",
  },
  {
    slug: "oaxaca-mexico",
    name: "Oaxaca",
    country: "México",
    region: "CENTRAL_AMERICA_CARIBBEAN",
    categories: ["BUDGET_DESTINATION", "REMOTE_FRIENDLY"],
    summary: "Gastronomia, artesanato e ritmo tranquilo para quem trabalha à distância.",
    description:
      "Cidade colonial com forte cena cultural. Útil para estadias de um a três meses. Todos os números são ilustrativos.",
    dailyBudgetReais: 230,
    remoteWorkScore: 4,
    internetNotes: "Ilustrativo: boa em hospedagens voltadas a nômades; instável em áreas rurais.",
    coworkingNotes: "Ilustrativo: alguns coworkings pequenos e muitos cafés com tomadas.",
    bestSeason: "Outubro a abril",
    imageKey: "oaxaca-mexico",
  },
  {
    slug: "tbilisi-georgia",
    name: "Tbilisi",
    country: "Geórgia",
    region: "EUROPE",
    categories: ["BUDGET_DESTINATION", "REMOTE_FRIENDLY"],
    summary: "Capital de ruas históricas entre a Europa e a Ásia, com custo diário baixo.",
    description:
      "Cidade com comunidade crescente de trabalhadores remotos. Regras de entrada e permanência mudam: confira sempre fontes oficiais. Valores ilustrativos.",
    dailyBudgetReais: 240,
    remoteWorkScore: 4,
    internetNotes: "Ilustrativo: internet residencial em geral estável nas áreas centrais.",
    coworkingNotes: "Ilustrativo: espaços compartilhados no centro e em bairros próximos.",
    bestSeason: "Abril a junho e setembro a outubro",
    imageKey: "tbilisi-georgia",
  },
  {
    slug: "chiang-mai-tailandia",
    name: "Chiang Mai",
    country: "Tailândia",
    region: "ASIA",
    categories: ["REMOTE_FRIENDLY", "BUDGET_DESTINATION"],
    summary: "Referência em comunidade nômade, com coworkings, cafés e custo baixo.",
    description:
      "Cidade ao norte do país com muitos espaços de trabalho. A qualidade do ar varia conforme a estação. Todos os valores são ilustrativos.",
    dailyBudgetReais: 210,
    remoteWorkScore: 5,
    internetNotes: "Ilustrativo: ampla oferta de fibra em coworkings e condomínios.",
    coworkingNotes: "Ilustrativo: grande quantidade de espaços e eventos de comunidade.",
    bestSeason: "Novembro a fevereiro",
    imageKey: "chiang-mai-tailandia",
  },
  {
    slug: "da-nang-vietna",
    name: "Da Nang",
    country: "Vietnã",
    region: "ASIA",
    categories: ["BUDGET_DESTINATION"],
    summary: "Cidade litorânea com praias urbanas e custo diário baixo.",
    description:
      "Combina praia, montanhas próximas e infraestrutura urbana. Informações e valores são apenas ilustrativos.",
    dailyBudgetReais: 180,
    remoteWorkScore: 3,
    internetNotes: "Ilustrativo: conexão geralmente boa em apartamentos novos.",
    coworkingNotes: "Ilustrativo: alguns espaços perto da orla.",
    bestSeason: "Fevereiro a maio",
    imageKey: "da-nang-vietna",
  },
  {
    slug: "florianopolis-brasil",
    name: "Florianópolis",
    country: "Brasil",
    region: "SOUTH_AMERICA",
    categories: ["REMOTE_FRIENDLY"],
    summary: "Ilha com praias, polo de tecnologia e muitos espaços para trabalho remoto.",
    description:
      "Boa estrutura para trabalhar à distância sem mudar de idioma. Custos variam bastante por temporada; valores desta página são ilustrativos.",
    dailyBudgetReais: 340,
    remoteWorkScore: 5,
    internetNotes: "Ilustrativo: fibra amplamente disponível; confirme em temporada alta.",
    coworkingNotes: "Ilustrativo: coworkings em diferentes bairros da ilha.",
    bestSeason: "Setembro a abril",
    imageKey: "florianopolis-brasil",
  },
  {
    slug: "cidade-do-cabo-africa-do-sul",
    name: "Cidade do Cabo",
    country: "África do Sul",
    region: "AFRICA",
    categories: ["REMOTE_FRIENDLY"],
    summary: "Montanha e oceano na mesma cidade, com boa infraestrutura de coworking.",
    description:
      "Destino com comunidade remota ativa. Segurança e energia elétrica pedem planejamento. Valores ilustrativos.",
    dailyBudgetReais: 330,
    remoteWorkScore: 4,
    internetNotes: "Ilustrativo: fibra em bairros centrais; confirme backup de energia.",
    coworkingNotes: "Ilustrativo: diversos coworkings no centro e na orla.",
    bestSeason: "Novembro a março",
    imageKey: "cidade-do-cabo-africa-do-sul",
  },
  {
    slug: "porto-portugal",
    name: "Porto",
    country: "Portugal",
    region: "EUROPE",
    categories: ["REMOTE_FRIENDLY"],
    summary: "Cidade compacta à beira do rio, boa para quem fala português e quer base europeia.",
    description:
      "Custos mais altos que outros destinos desta lista. Regras de visto e residência mudam: consulte fontes oficiais. Valores ilustrativos.",
    dailyBudgetReais: 420,
    remoteWorkScore: 5,
    internetNotes: "Ilustrativo: fibra amplamente disponível.",
    coworkingNotes: "Ilustrativo: muitos coworkings e cafés para trabalho.",
    bestSeason: "Maio a outubro",
    imageKey: "porto-portugal",
  },
];

const DEMO_LINK = (slug: string) => `https://example.com/nomadfree-demo/${slug}`;

export const opportunities: OpportunitySeed[] = [
  {
    slug: "troca-recepcao-hostel-aurora-medellin",
    title: "Recepção em troca de diárias — Hostel Aurora (demo)",
    category: "ACCOMMODATION_EXCHANGE",
    destinationSlug: "medellin-colombia",
    summary: "Exemplo fictício de troca: turnos de recepção por cama em dormitório.",
    conditions:
      "Exemplo fictício. Normalmente trocas assim pedem compromisso mínimo de semanas, horários fixos e despesas próprias com alimentação. Confirme tudo diretamente com o anfitrião.",
    hoursPerWeek: 20,
    dailyCostReais: 60,
    externalUrl: DEMO_LINK("troca-recepcao-hostel-aurora-medellin"),
    imageKey: "op-medellin-hostel",
  },
  {
    slug: "voluntariado-horta-comunitaria-medellin",
    title: "Horta comunitária urbana (demo)",
    category: "VOLUNTEERING",
    destinationSlug: "medellin-colombia",
    summary: "Exemplo fictício de voluntariado em horta de bairro com moradia compartilhada.",
    conditions:
      "Exemplo fictício. Programas reais podem cobrar taxa de participação e exigir seguro-viagem.",
    hoursPerWeek: 15,
    dailyCostReais: 70,
    imageKey: "op-medellin-horta",
  },
  {
    slug: "troca-atendimento-cafe-cusco",
    title: "Atendimento em café por hospedagem (demo)",
    category: "ACCOMMODATION_EXCHANGE",
    destinationSlug: "cusco-peru",
    summary: "Exemplo fictício: quarto privado em troca de turnos em um café.",
    conditions:
      "Exemplo fictício. Em altitude elevada, a aclimatação pode afetar a carga de trabalho. Condições reais variam.",
    hoursPerWeek: 25,
    dailyCostReais: 55,
    imageKey: "op-cusco-cafe",
  },
  {
    slug: "voluntariado-ingles-escola-cusco",
    title: "Aulas de inglês em escola rural (demo)",
    category: "VOLUNTEERING",
    destinationSlug: "cusco-peru",
    summary: "Exemplo fictício de voluntariado de ensino com hospedagem em casa de família.",
    conditions:
      "Exemplo fictício. Programas desse tipo podem cobrar taxa de intermediação e pedir verificação de antecedentes.",
    hoursPerWeek: 12,
    dailyCostReais: 65,
    upfrontFeeReais: 450,
    externalUrl: DEMO_LINK("voluntariado-ingles-escola-cusco"),
    imageKey: "op-cusco-escola",
  },
  {
    slug: "troca-design-guesthouse-oaxaca",
    title: "Design de materiais por hospedagem (demo)",
    category: "ACCOMMODATION_EXCHANGE",
    destinationSlug: "oaxaca-mexico",
    summary: "Exemplo fictício: criação de peças gráficas em troca de quarto.",
    conditions:
      "Exemplo fictício. Acordos reais devem ser combinados por escrito, com escopo e prazo claros.",
    hoursPerWeek: 10,
    dailyCostReais: 80,
    imageKey: "op-oaxaca-guesthouse",
  },
  {
    slug: "voluntariado-ceramica-oaxaca",
    title: "Ateliê de cerâmica comunitário (demo)",
    category: "VOLUNTEERING",
    destinationSlug: "oaxaca-mexico",
    summary: "Exemplo fictício de apoio em ateliê com refeições compartilhadas.",
    conditions: "Exemplo fictício. Pode envolver taxa de materiais e estadia mínima.",
    hoursPerWeek: 14,
    dailyCostReais: 75,
    imageKey: "op-oaxaca-ceramica",
  },
  {
    slug: "troca-guesthouse-chiang-mai",
    title: "Guesthouse por turnos de manhã (demo)",
    category: "ACCOMMODATION_EXCHANGE",
    destinationSlug: "chiang-mai-tailandia",
    summary: "Exemplo fictício: turnos curtos de manhã em troca de quarto simples.",
    conditions:
      "Exemplo fictício. Verifique a legalidade de trabalho no seu tipo de visto antes de aceitar qualquer troca.",
    hoursPerWeek: 18,
    dailyCostReais: 50,
    imageKey: "op-chiang-mai-guesthouse",
  },
  {
    slug: "voluntariado-santuario-animais-chiang-mai",
    title: "Santuário de animais (demo)",
    category: "VOLUNTEERING",
    destinationSlug: "chiang-mai-tailandia",
    summary: "Exemplo fictício de voluntariado com taxa de participação e alimentação inclusa.",
    conditions:
      "Exemplo fictício. Programas reais costumam cobrar taxa; pesquise reputação e práticas de bem-estar animal.",
    hoursPerWeek: 30,
    dailyCostReais: 45,
    upfrontFeeReais: 200,
    externalUrl: DEMO_LINK("voluntariado-santuario-animais-chiang-mai"),
    imageKey: "op-chiang-mai-santuario",
  },
  {
    slug: "troca-pousada-florianopolis",
    title: "Pousada por conteúdo e atendimento (demo)",
    category: "ACCOMMODATION_EXCHANGE",
    destinationSlug: "florianopolis-brasil",
    summary: "Exemplo fictício: hospedagem em troca de fotos e atendimento online.",
    conditions:
      "Exemplo fictício. Em temporada, anfitriões costumam reduzir trocas; combine datas com antecedência.",
    hoursPerWeek: 20,
    dailyCostReais: 90,
    imageKey: "op-florianopolis-pousada",
  },
  {
    slug: "voluntariado-ecovila-tbilisi",
    title: "Ecovila nos arredores (demo)",
    category: "VOLUNTEERING",
    destinationSlug: "tbilisi-georgia",
    summary: "Exemplo fictício de trabalho em horta e construção natural com quarto compartilhado.",
    conditions: "Exemplo fictício. Transporte até a cidade pode ser por conta do voluntário.",
    hoursPerWeek: 24,
    dailyCostReais: 55,
    imageKey: "op-tbilisi-ecovila",
  },
  {
    slug: "troca-hostel-da-nang",
    title: "Hostel na praia por turnos de limpeza (demo)",
    category: "ACCOMMODATION_EXCHANGE",
    destinationSlug: "da-nang-vietna",
    summary: "Exemplo fictício: cama em dormitório em troca de apoio diário.",
    conditions: "Exemplo fictício. Condições reais, inclusive vistos de trabalho, variam.",
    hoursPerWeek: 20,
    dailyCostReais: 40,
    imageKey: "op-da-nang-hostel",
  },
  {
    slug: "voluntariado-vinhedo-porto",
    title: "Quinta com vinhedo na época de colheita (demo)",
    category: "VOLUNTEERING",
    destinationSlug: "porto-portugal",
    summary: "Exemplo fictício de apoio sazonal em propriedade rural próxima.",
    conditions:
      "Exemplo fictício. Atividade sazonal; regras de trabalho para estrangeiros devem ser conferidas em fontes oficiais.",
    hoursPerWeek: 28,
    dailyCostReais: 85,
    imageKey: "op-porto-vinhedo",
  },
  {
    slug: "voluntariado-costa-cidade-do-cabo",
    title: "Projeto de conservação costeira (demo)",
    category: "VOLUNTEERING",
    destinationSlug: "cidade-do-cabo-africa-do-sul",
    summary: "Exemplo fictício de voluntariado com taxa de programa e moradia compartilhada.",
    conditions:
      "Exemplo fictício. Programas reais frequentemente cobram taxa e pedem seguro e vacinas específicas.",
    hoursPerWeek: 20,
    dailyCostReais: 100,
    upfrontFeeReais: 600,
    externalUrl: DEMO_LINK("voluntariado-costa-cidade-do-cabo"),
    imageKey: "op-cidade-do-cabo-costa",
  },
];
