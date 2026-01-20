import { getDictionary } from "../../../../get-dictionary";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";

// Hardcoded articles data
const articles: Record<string, any> = {
    "ia-nao-e-oraculo-parceiro": {
        titlePt: "IA não é oráculo. É parceiro. E parceiro precisa de limites.",
        titleEn: "AI is not an Oracle. It is a Partner. And partners need limits.",
        titleEs: "La IA no es un Oráculo. Es un Socio. Y los socios necesitan límites.",
        category: "Tech",
        date: "14 Jan. 2026",
        readTime: 5,
        image: "/images/blog/ai_partner_insight.png",
        author: "Erik Amorim",
        authorTitle: "CEO, BrixAurea",
        contentPt: `
            <p>A gente está vivendo uma fase curiosa: nunca tivemos tanta informação… e, ao mesmo tempo, nunca foi tão fácil se enganar com informação.</p>
            
            <p>Uso IA todos os dias. Gosto. Acelera. Entrega insight.</p>
            
            <p>Mas tem uma coisa que eu aprendi rápido e quero deixar registrada aqui:</p>
            
            <blockquote class="border-l-4 border-cyan-500 pl-6 my-8 italic text-gray-700 text-xl">
                <strong>IA é treinada pra ser plausível. O ser humano é treinado pra ser responsável.</strong> São coisas diferentes.
            </blockquote>
            
            <h3 class="text-2xl font-bold mt-12 mb-6">Onde isso pode dar errado?</h3>
            
            <p>A IA te dá a resposta <strong>"que faz sentido"</strong>.</p>
            
            <p>O humano tem que perguntar: <strong>"onde isso pode dar errado?"</strong></p>
            
            <p>E essa é, pra mim, a pergunta mais importante que um profissional sério deve fazer pra uma IA:</p>
            
            <p class="text-lg font-medium text-gray-900 my-6"><strong>"O que você NÃO está vendo / não consegue garantir nessa resposta?"</strong></p>
            
            <p>Porque aí:</p>
            <ul class="space-y-2">
                <li>você revela o ponto cego do modelo;</li>
                <li>você lembra que contexto não está nos dados;</li>
                <li>e você evita decisão ruim vestida de resposta bonita.</li>
            </ul>
            
            <h3 class="text-2xl font-bold mt-12 mb-6">Contexto em Real Estate e Finanças</h3>
            
            <p>E por que isso é relevante pra negócio, finanças e real estate?</p>
            
            <p>Porque <strong>erro de contexto em finanças custa dinheiro</strong>.</p>
            
            <p>IA não sabe que o investidor está mais avesso a risco esse mês. IA não sabe que o sócio brigou ontem. IA não sabe que o banco mudou a linha de crédito na segunda-feira.</p>
            
            <p>Quem sabe disso é <strong>gente</strong>.</p>
            
            <p>Gente que está na operação. Gente que olha relatório, mas também olha no olho.</p>
            
            <p>Por isso, minha visão é simples:</p>
            
            <blockquote class="border-l-4 border-cyan-500 pl-6 my-8 bg-cyan-50 p-6 rounded-r-lg">
                <p class="mb-2"><strong>IA boa não substitui profissional sério.</strong></p>
                <p class="mb-2"><strong>IA boa potencializa profissional sério.</strong></p>
                <p class="mb-2"><strong>IA ruim é a que responde tudo.</strong></p>
                <p><strong>IA boa é a que diz onde pode estar errada.</strong></p>
            </blockquote>
            
            <p>Na <strong>BrixAurea</strong>, isso pra nós não é frase de efeito. É método.</p>
            
            <p>A gente usa IA pra acelerar análise, cenários e relatórios — mas <strong>a decisão e a responsabilidade continuam humanas</strong>.</p>
            
            <p>Porque cliente não paga por chute bem escrito; paga por <strong>governança, contexto e responsabilidade</strong>.</p>
            
            <p class="text-lg font-medium text-gray-900 mt-8">Se você está usando IA na sua empresa e não está perguntando "onde isso quebra?", você não está fazendo transformação digital.</p>
            
            <p class="text-lg font-medium text-gray-900">Você só está terceirizando o erro.</p>
        `,
        contentEn: `
            <p>We are living in a curious phase: we have never had so much information... and, at the same time, it has never been so easy to be deceived by information.</p>
            
            <p>I use AI every day. I like it. It accelerates. It delivers insight.</p>
            
            <p>But there is one thing I learned quickly and want to record here:</p>
            
            <blockquote class="border-l-4 border-cyan-500 pl-6 my-8 italic text-gray-700 text-xl">
                <strong>AI is trained to be plausible. Humans are trained to be responsible.</strong> These are different things.
            </blockquote>
            
            <h3 class="text-2xl font-bold mt-12 mb-6">Where can this go wrong?</h3>
            
            <p>AI gives you the answer <strong>"that makes sense"</strong>.</p>
            
            <p>The human has to ask: <strong>"where can this go wrong?"</strong></p>
            
            <p>And that is, for me, the most important question a serious professional should ask an AI:</p>
            
            <p class="text-lg font-medium text-gray-900 my-6"><strong>"What are you NOT seeing / cannot guarantee in this response?"</strong></p>
            
            <p>Because then:</p>
            <ul class="space-y-2">
                <li>you reveal the model's blind spot;</li>
                <li>you remember that context is not in the data;</li>
                <li>and you avoid a bad decision dressed as a pretty answer.</li>
            </ul>
            
            <h3 class="text-2xl font-bold mt-12 mb-6">Context in Real Estate and Finance</h3>
            
            <p>And why is this relevant to business, finance, and real estate?</p>
            
            <p>Because <strong>context errors in finance cost money</strong>.</p>
            
            <p>AI doesn't know the investor is more risk-averse this month. AI doesn't know the partners had a disagreement yesterday. AI doesn't know the bank changed the credit line on Monday.</p>
            
            <p>Who knows this is <strong>people</strong>.</p>
            
            <p>People who are in the operation. People who look at reports, but also look in the eye.</p>
            
            <p>For this reason, my vision is simple:</p>
            
            <blockquote class="border-l-4 border-cyan-500 pl-6 my-8 bg-cyan-50 p-6 rounded-r-lg">
                <p class="mb-2"><strong>Good AI doesn't replace serious professionals.</strong></p>
                <p class="mb-2"><strong>Good AI empowers serious professionals.</strong></p>
                <p class="mb-2"><strong>Bad AI is the one that answers everything.</strong></p>
                <p><strong>Good AI is the one that says where it might be wrong.</strong></p>
            </blockquote>
            
            <p>At <strong>BrixAurea</strong>, this is not a catchphrase for us. It is a method.</p>
            
            <p>We use AI to accelerate analysis, scenarios, and reports — but <strong>the decision and responsibility remain human</strong>.</p>
            
            <p>Because clients don't pay for well-written guesses; they pay for <strong>governance, context, and accountability</strong>.</p>
            
            <p class="text-lg font-medium text-gray-900 mt-8">If you are using AI in your company and not asking "where does this break?", you are not doing digital transformation.</p>
            
            <p class="text-lg font-medium text-gray-900">You are just outsourcing the error.</p>
        `
    },
    "estruturacao-financeira-real-estate": {
        titlePt: "Estruturação Financeira: O Diferencial entre Lucro e Prejuízo",
        titleEn: "Financial Structuring: The Gap Between Profit and Loss",
        titleEs: "Estructuración Financiera: La Diferencia entre Lucro y Pérdida",
        category: "Investment",
        date: "14 Jan. 2026",
        readTime: 7,
        image: "/images/blog/blog_finance_insight.png",
        author: "Erik Amorim",
        authorTitle: "CEO, BrixAurea",
        contentPt: `
            <p>No desenvolvimento imobiliário, o lucro muitas vezes não está na venda.</p>
            
            <p>Está na compra. E na forma como o capital é estruturado.</p>
            
            <p>Na BrixAurea, vemos diariamente que a diferença entre um projeto que retorna <strong>25% de TIR</strong> e um que estagna em <strong>12%</strong> reside na eficiência do <strong>Capital Stack</strong>.</p>
            
            <h3 class="text-2xl font-bold mt-12 mb-6">O que é Capital Stack?</h3>
            
            <p>Capital Stack é a estrutura de camadas de financiamento que sustenta um projeto imobiliário.</p>
            
            <p>Pense como uma pilha onde cada andar tem um custo e um risco diferente:</p>
            
            <ul class="space-y-3">
                <li><strong>Equity (Capital Próprio):</strong> O dinheiro do desenvolvedor ou investidores. Maior risco, maior retorno.</li>
                <li><strong>Mezzanine:</strong> Capital intermediário, muitas vezes com juros mais altos que o senior debt, mas mais flexível.</li>
                <li><strong>Senior Debt (Dívida Sênior):</strong> O empréstimo bancário tradicional. Menor custo, mas exige garantias sólidas.</li>
            </ul>
            
            <h3 class="text-2xl font-bold mt-12 mb-6">Equity vs. Debt: O Equilíbrio que Define o ROI</h3>
            
            <p>Encontrar o equilíbrio certo entre aporte próprio e financiamento de construção é <strong>crítico</strong>.</p>
            
            <p>Uma alavancagem excessiva em momentos de juros voláteis pode asfixiar o fluxo de caixa.</p>
            
            <p>O excesso de equity reduz a rentabilidade do investidor.</p>
            
            <blockquote class="border-l-4 border-cyan-500 pl-6 my-8 bg-cyan-50 p-6 rounded-r-lg">
                <p class="font-bold mb-2">Regra de Ouro:</p>
                <p>Em mercados estáveis, estruture 30-40% de equity.</p>
                <p>Em mercados voláteis, aumente para 50-60% para reduzir exposição a taxas de juros.</p>
            </blockquote>
            
            <h3 class="text-2xl font-bold mt-12 mb-6">O Erro Clássico: Alavancagem Máxima sem Stress Test</h3>
            
            <p>Muitos desenvolvedores buscam maximizar a alavancagem para "economizar" equity.</p>
            
            <p>O problema?</p>
            
            <p><strong>Não fazem stress test de cenários adversos:</strong></p>
            
            <ul class="space-y-2">
                <li>E se os juros subirem 2%?</li>
                <li>E se a absorção cair 30%?</li>
                <li>E se o custo de construção aumentar 15%?</li>
            </ul>
            
            <p class="mt-6">Na BrixAurea, rodamos <strong>no mínimo 3 cenários</strong> (otimista, realista, pessimista) antes de definir a estrutura de capital.</p>
            
            <p>Isso não é paranoia. É <strong>governança</strong>.</p>
            
            <h3 class="text-2xl font-bold mt-12 mb-6">O Papel da Governança Financeira</h3>
            
            <p>Não basta ter o capital.</p>
            
            <p>É preciso ter <strong>governança sobre o seu desembolso</strong>.</p>
            
            <p>Orçamentos paramétricos e curvas S de desembolso precisam ser monitorados semanalmente para evitar o "creep" de custos que destrói o ROI planejado.</p>
            
            <p class="mt-8"><strong>Ferramentas que Usamos:</strong></p>
            <ul class="space-y-2">
                <li>Orçamento Paramétrico ($/sqft)</li>
                <li>Curva S de Desembolso (cash flow projetado vs. realizado)</li>
                <li>Relatórios semanais de Cost Variance</li>
            </ul>
            
            <h3 class="text-2xl font-bold mt-12 mb-6">Estruturação é Strategy, Não Tática</h3>
            
            <p>Estruturação financeira não é "pegar o empréstimo mais barato".</p>
            
            <p>É desenhar um <strong>motor de capital</strong> que:</p>
            <ul class="space-y-2">
                <li>Suporte o projeto em cenários adversos</li>
                <li>Maximize retorno em cenários favoráveis</li>
                <li>Mantenha flexibilidade estratégica</li>
            </ul>
            
            <p class="text-lg font-medium text-gray-900 mt-8">Se você está desenvolvendo imobiliário e ainda não revisou sua estrutura de capital nos últimos 6 meses, você está correndo riscos desnecessários.</p>
        `,
        contentEn: `
            <p>In real estate development, profit is often not in the sale.</p>
            
            <p>It's in the purchase. And in the way capital is structured.</p>
            
            <p>At BrixAurea, we see daily that the difference between a project that returns <strong>25% IRR</strong> and one that stagnates at <strong>12%</strong> lies in the efficiency of the <strong>Capital Stack</strong>.</p>
            
            <h3 class="text-2xl font-bold mt-12 mb-6">What is Capital Stack?</h3>
            
            <p>Capital Stack is the structure of financing layers that supports a real estate project.</p>
            
            <p>Think of it as a stack where each floor has a different cost and risk:</p>
            
            <ul class="space-y-3">
                <li><strong>Equity (Own Capital):</strong> The developer's or investors' money. Higher risk, higher return.</li>
                <li><strong>Mezzanine:</strong> Intermediate capital, often with higher interest than senior debt, but more flexible.</li>
                <li><strong>Senior Debt:</strong> Traditional bank loan. Lower cost, but requires solid guarantees.</li>
            </ul>
            
            <h3 class="text-2xl font-bold mt-12 mb-6">Equity vs. Debt: The Balance that Defines ROI</h3>
            
            <p>Finding the right balance between own contribution and construction financing is <strong>critical</strong>.</p>
            
            <p>Excessive leverage in times of volatile interest rates can choke cash flow.</p>
            
            <p>Excess equity reduces investor profitability.</p>
            
            <blockquote class="border-l-4 border-cyan-500 pl-6 my-8 bg-cyan-50 p-6 rounded-r-lg">
                <p class="font-bold mb-2">Golden Rule:</p>
                <p>In stable markets, structure 30-40% equity.</p>
                <p>In volatile markets, increase to 50-60% to reduce interest rate exposure.</p>
            </blockquote>
            
            <h3 class="text-2xl font-bold mt-12 mb-6">The Classic Mistake: Maximum Leverage without Stress Test</h3>
            
            <p>Many developers seek to maximize leverage to "save" equity.</p>
            
            <p>The problem?</p>
            
            <p><strong>They don't stress test adverse scenarios:</strong></p>
            
            <ul class="space-y-2">
                <li>What if interest rates rise by 2%?</li>
                <li>What if absorption drops by 30%?</li>
                <li>What if construction costs increase by 15%?</li>
            </ul>
            
            <p class="mt-6">At BrixAurea, we run <strong>at least 3 scenarios</strong> (optimistic, realistic, pessimistic) before defining the capital structure.</p>
            
            <p>This is not paranoia. It's <strong>governance</strong>.</p>
            
            <h3 class="text-2xl font-bold mt-12 mb-6">The Role of Financial Governance</h3>
            
            <p>It's not enough to have capital.</p>
            
            <p>You need to have <strong>governance over its disbursement</strong>.</p>
            
            <p>Parametric budgets and S-curves of disbursement need to be monitored weekly to avoid the cost "creep" that destroys planned ROI.</p>
            
            <p class="mt-8"><strong>Tools We Use:</strong></p>
            <ul class="space-y-2">
                <li>Parametric Budget ($/sqft)</li>
                <li>S-Curve Disbursement (projected vs. actual cash flow)</li>
                <li>Weekly Cost Variance Reports</li>
            </ul>
            
            <h3 class="text-2xl font-bold mt-12 mb-6">Structuring is Strategy, Not Tactics</h3>
            
            <p>Financial structuring is not about "getting the cheapest loan".</p>
            
            <p>It's about designing a <strong>capital engine</strong> that:</p>
            <ul class="space-y-2">
                <li>Supports the project in adverse scenarios</li>
                <li>Maximizes return in favorable scenarios</li>
                <li>Maintains strategic flexibility</li>
            </ul>
            
            <p class="text-lg font-medium text-gray-900 mt-8">If you are developing real estate and haven't reviewed your capital structure in the last 6 months, you are taking unnecessary risks.</p>
        `
    },
    "maximizar-gdv-mix-unidades": {
        titlePt: "Maximizar o VGV: A Ciência do Mix de Unidades",
        titleEn: "Maximizing GDV: The Science of Unit Mix",
        titleEs: "Maximizar el GDV: La Ciencia del Mix de Unidades",
        category: "Market",
        date: "14 Jan. 2026",
        readTime: 6,
        image: "/images/blog/blog_real_estate_insight.png",
        author: "Erik Amorim",
        authorTitle: "CEO, BrixAurea",
        contentPt: `
            <p>Muitos incorporadores se apaixonam pelo projeto arquitetônico antes de validar a absorção do mercado.</p>
            
            <p>O segredo de um <strong>VGV (Valor Geral de Vendas)</strong> saudável está na sintonia fina entre o que o mercado local deseja e o que a legislação permite construir.</p>
            
            <h3 class="text-2xl font-bold mt-12 mb-6">VGV vs. Custo: A Matemática que Importa</h3>
            
            <p>O VGV é a soma de todas as receitas de venda projetadas.</p>
            
            <p>Parece simples, mas a composição dessas receitas define se o projeto será lucrativo ou marginal.</p>
            
            <p>E isso começa no <strong>Unit Mix</strong>.</p>
            
            <blockquote class="border-l-4 border-cyan-500 pl-6 my-8 bg-cyan-50 p-6 rounded-r-lg">
                <p class="font-bold mb-2">Regra Fundamental:</p>
                <p>VGV otimizado não é vender pelo maior preço, mas criar o produto que o mercado absorve rapidamente ao preço correto.</p>
            </blockquote>
            
            <h3 class="text-2xl font-bold mt-12 mb-6">Dados sobre Intuição</h3>
            
            <p>O uso de dados demográficos deve ditar se o terreno deve receber:</p>
            
            <ul class="space-y-2">
                <li>Studios e 1-bed (jovens profissionais, solteiros)</li>
                <li>2-bed (casais jovens, pequenas famílias)</li>
                <li>3-bed (famílias estabelecidas)</li>
                <li>4-bed+ (famílias grandes, mercado de luxo)</li>
            </ul>
            
            <p class="mt-6">Um erro cometido no mix de unidades no <strong>Mês 1</strong> pode se tornar um estoque invendável no <strong>Mês 24</strong>.</p>
            
            <p>E isso custa muito dinheiro.</p>
            
            <h3 class="text-2xl font-bold mt-12 mb-6">Case Real: Orlando, FL</h3>
            
            <p>Analisamos um projeto de townhomes em Orlando onde o desenvolvedor inicial planejava 80% de unidades 4-bed.</p>
            
            <p>Nossa análise demográfica mostrou que a demanda local era majoritariamente para 3-bed (famílias de 3-4 pessoas).</p>
            
            <p class="mt-6"><strong>Ajustamos o mix:</strong></p>
            <ul class="space-y-1">
                <li>60% de 3-bed</li>
                <li>30% de 4-bed</li>
                <li>10% de 2-bed</li>
            </ul>
            
            <p class="mt-6"><strong>Resultado:</strong></p>
            <ul class="space-y-2">
                <li>Absorção 40% mais rápida</li>
                <li>Redução de 6 meses no ciclo de vendas</li>
                <li>Economia de $180k em custos de carregamento</li>
            </ul>
            
            <h3 class="text-2xl font-bold mt-12 mb-6">Eficiência de Layout = Maior VGV</h3>
            
            <p>Nem sempre o maior sqft privativo gera o maior ticket.</p>
            
            <p>Muitas vezes, a inteligência está em criar layouts eficientes que permitam um <strong>preço por pé quadrado maior</strong>.</p>
            
            <p>Isso reduz o custo de construção total sem comprometer a percepção de valor do cliente final.</p>
            
            <blockquote class="border-l-4 border-cyan-500 pl-6 my-8 italic text-gray-700 text-lg">
                <strong>Exemplo:</strong> Uma unidade de 1.200 sqft com layout eficiente pode valer $350/sqft, enquanto uma de 1.400 sqft mal planejada vale $310/sqft. O VGV da primeira é maior, com custo menor.
            </blockquote>
            
            <h3 class="text-2xl font-bold mt-12 mb-6">Ferramentas para Maximizar VGV</h3>
            
            <p>Na BrixAurea, usamos:</p>
            <ul class="space-y-2">
                <li><strong>Análise Demográfica Local:</strong> Dados do Census, renda média, migração</li>
                <li><strong>Benchmarking de Concorrência:</strong> O que está vendendo rápido vs. estagnado</li>
                <li><strong>Simulação de Cenários:</strong> Impacto de diferentes mix no VGV e absorção</li>
            </ul>
            
            <h3 class="text-2xl font-bold mt-12 mb-6">Mix é Estratégia, Não Design</h3>
            
            <p>O mix de unidades não é uma decisão do arquiteto.</p>
            
            <p>É uma decisão <strong>estratégica</strong> baseada em:</p>
            <ul class="space-y-2">
                <li>Dados de mercado</li>
                <li>Viabilidade financeira</li>
                <li>Absorção projetada</li>
            </ul>
            
            <p class="text-lg font-medium text-gray-900 mt-8">Se você está desenvolvendo sem validar o mix com dados reais, você está apostando, não investindo.</p>
        `,
        contentEn: `
            <p>Many developers fall in love with the architectural design before validating market absorption.</p>
            
            <p>The secret to a healthy <strong>GDV (Gross Development Value)</strong> lies in the fine-tuning between what the local market wants and what the legislation allows to be built.</p>
            
            <h3 class="text-2xl font-bold mt-12 mb-6">GDV vs. Cost: The Math that Matters</h3>
            
            <p>GDV is the sum of all projected sales revenues.</p>
            
            <p>Seems simple, but the composition of these revenues defines whether the project will be profitable or marginal.</p>
            
            <p>And it starts with the <strong>Unit Mix</strong>.</p>
            
            <blockquote class="border-l-4 border-cyan-500 pl-6 my-8 bg-cyan-50 p-6 rounded-r-lg">
                <p class="font-bold mb-2">Fundamental Rule:</p>
                <p>Optimized GDV is not about selling at the highest price, but creating the product that the market absorbs quickly at the right price.</p>
            </blockquote>
            
            <h3 class="text-2xl font-bold mt-12 mb-6">Data over Intuition</h3>
            
            <p>The use of demographic data should dictate whether the land should receive:</p>
            
            <ul class="space-y-2">
                <li>Studios and 1-bed (young professionals, singles)</li>
                <li>2-bed (young couples, small families)</li>
                <li>3-bed (established families)</li>
                <li>4-bed+ (large families, luxury market)</li>
            </ul>
            
            <p class="mt-6">A mistake made in the unit mix in <strong>Month 1</strong> can become unsellable stock in <strong>Month 24</strong>.</p>
            
            <p>And that costs a lot of money.</p>
            
            <h3 class="text-2xl font-bold mt-12 mb-6">Real Case: Orlando, FL</h3>
            
            <p>We analyzed a townhome project in Orlando where the initial developer planned 80% of 4-bed units.</p>
            
            <p>Our demographic analysis showed that local demand was mostly for 3-bed (families of 3-4 people).</p>
            
            <p class="mt-6"><strong>We adjusted the mix:</strong></p>
            <ul class="space-y-1">
                <li>60% 3-bed</li>
                <li>30% 4-bed</li>
                <li>10% 2-bed</li>
            </ul>
            
            <p class="mt-6"><strong>Result:</strong></p>
            <ul class="space-y-2">
                <li>40% faster absorption</li>
                <li>6-month reduction in sales cycle</li>
                <li>$180k savings in carrying costs</li>
            </ul>
            
            <h3 class="text-2xl font-bold mt-12 mb-6">Layout Efficiency = Higher GDV</h3>
            
            <p>Not always the largest private sqft generates the highest ticket.</p>
            
            <p>Often, the intelligence is in creating efficient layouts that allow for a <strong>higher price per square foot</strong>.</p>
            
            <p>This reduces total construction cost without compromising the end customer's value perception.</p>
            
            <blockquote class="border-l-4 border-cyan-500 pl-6 my-8 italic text-gray-700 text-lg">
                <strong>Example:</strong> A 1,200 sqft unit with efficient layout can be worth $350/sqft, while a poorly planned 1,400 sqft is worth $310/sqft. The first one's GDV is higher, with lower cost.
            </blockquote>
            
            <h3 class="text-2xl font-bold mt-12 mb-6">Tools to Maximize GDV</h3>
            
            <p>At BrixAurea, we use:</p>
            <ul class="space-y-2">
                <li><strong>Local Demographic Analysis:</strong> Census data, average income, migration</li>
                <li><strong>Competition Benchmarking:</strong> What's selling fast vs. stagnant</li>
                <li><strong>Scenario Simulation:</strong> Impact of different mixes on GDV and absorption</li>
            </ul>
            
            <h3 class="text-2xl font-bold mt-12 mb-6">Mix is Strategy, Not Design</h3>
            
            <p>The unit mix is not an architect's decision.</p>
            
            <p>It's a <strong>strategic decision</strong> based on:</p>
            <ul class="space-y-2">
                <li>Market data</li>
                <li>Financial feasibility</li>
                <li>Projected absorption</li>
            </ul>
            
            <p class="text-lg font-medium text-gray-900 mt-8">If you are developing without validating the mix with real data, you are gambling, not investing.</p>
        `
    }
};

export default async function ArticlePage({ params }: { params: Promise<{ lang: string; slug: string }> }) {
    const { lang, slug } = await params;
    const dictionary = await getDictionary(lang);

    // Check if article exists
    const article = articles[slug];
    if (!article) {
        notFound();
    }

    const title = lang === 'pt' ? article.titlePt : lang === 'es' ? article.titleEs : article.titleEn;
    const content = lang === 'pt' ? article.contentPt : lang === 'es' ? (article.contentEs || article.contentEn) : article.contentEn;

    // Share URLs
    const articleUrl = `https://brixaurea.com/${lang}/insights/${slug}`;
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(articleUrl)}`;
    const twitterUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(articleUrl)}&text=${encodeURIComponent(title)}`;

    return (
        <div className="flex flex-col min-h-screen bg-white">
            <Header lang={lang} dictionary={dictionary} />

            <main className="flex-1 py-12 md:py-20">
                <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <Link href={`/${lang}/insights`} className="inline-flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-cyan-600 mb-12 transition-colors group">
                        <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                        {lang === 'pt' ? 'Voltar para Insights' : lang === 'es' ? 'Volver a Insights' : 'Back to Insights'}
                    </Link>

                    <header className="mb-12">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="px-4 py-1.5 bg-cyan-50 text-cyan-600 rounded-full text-xs font-black uppercase tracking-[0.2em] border border-cyan-100">
                                {article.category}
                            </span>
                            <span className="text-gray-300">•</span>
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                                {article.readTime} MIN READ
                            </span>
                        </div>

                        <h1 className="text-4xl md:text-6xl font-black text-gray-900 mb-8 leading-[1.1] tracking-tight">
                            {title}
                        </h1>

                        <div className="flex items-center gap-4 py-8 border-y border-gray-100">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#081F2E] to-[#0F3A52] flex items-center justify-center font-bold text-white italic shadow-lg shadow-cyan-500/10">
                                BA
                            </div>
                            <div>
                                <p className="text-sm font-black text-gray-900 uppercase tracking-widest">{article.author}</p>
                                <p className="text-xs text-gray-500 font-medium">{article.authorTitle}</p>
                            </div>
                        </div>

                        {/* Share Buttons */}
                        <div className="flex items-center gap-3 mt-6">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                                {lang === 'pt' ? 'Compartilhar:' : lang === 'es' ? 'Compartir:' : 'Share:'}
                            </span>
                            <a
                                href={linkedInUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 px-4 py-2 bg-[#0077B5] text-white rounded-lg hover:bg-[#006399] transition-colors text-sm font-medium"
                            >
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                                </svg>
                                LinkedIn
                            </a>
                            <a
                                href={twitterUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium"
                            >
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                                </svg>
                                X (Twitter)
                            </a>
                        </div>
                    </header>

                    {article.image && (
                        <div className="aspect-[16/7] w-full mb-12 rounded-[2rem] overflow-hidden shadow-2xl shadow-cyan-900/10 border border-gray-100 relative">
                            <Image
                                src={article.image}
                                alt={title}
                                fill
                                className="object-cover"
                                style={{ objectPosition: '50% 40%' }}
                                loading="eager"
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
                            />
                        </div>
                    )}

                    <div
                        className="prose prose-lg prose-cyan max-w-none text-gray-700 leading-relaxed text-justify"
                        style={{ fontSize: '1.125rem', lineHeight: '1.875rem' }}
                        dangerouslySetInnerHTML={{ __html: content }}
                    />

                    {/* BrixAurea Signature */}
                    <div className="mt-16 pt-10 border-t border-gray-100">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-gradient-to-br from-[#081F2E] to-[#0F3A52] rounded-2xl flex items-center justify-center">
                                <span className="text-2xl font-black text-white italic">BA</span>
                            </div>
                            <div>
                                <p className="text-sm font-black text-gray-900">BrixAurea Intelligence</p>
                                <p className="text-xs text-gray-500">
                                    {lang === 'pt' ? 'Insights estratégicos para o mercado imobiliário' : lang === 'es' ? 'Insights estratégicos para el mercado inmobiliario' : 'Strategic insights for real estate market'}
                                </p>
                            </div>
                        </div>
                    </div>

                    <footer className="mt-20 pt-12 border-t border-gray-100">
                        <div className="bg-gray-900 shadow-2xl shadow-cyan-900/10 rounded-[2rem] p-10 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl group-hover:bg-cyan-500/20 transition-all"></div>

                            <div className="relative z-10 text-center md:text-left">
                                <h4 className="text-2xl font-bold text-white mb-2">
                                    {lang === 'pt' ? 'Análise Personalizada' : lang === 'es' ? 'Análisis Personalizado' : 'Customized Analysis'}
                                </h4>
                                <p className="text-gray-400 text-sm">
                                    {lang === 'pt' ? 'Nossa equipe de especialistas está pronta para analisar seu projeto.' : lang === 'es' ? 'Nuestro equipo de expertos está listo para analizar su proyecto.' : 'Our team of experts is ready to analyze your project.'}
                                </p>
                            </div>
                            <Link href={`/${lang}/auth/register`} className="relative z-10 bg-white text-gray-900 font-black uppercase tracking-widest text-[10px] px-8 py-5 rounded-2xl hover:bg-cyan-500 hover:text-white transition-all shadow-xl active:scale-95 whitespace-nowrap">
                                {lang === 'pt' ? 'Começar Agora' : lang === 'es' ? 'Comenzar Ahora' : 'Start Now'}
                            </Link>
                        </div>
                    </footer>
                </article>
            </main>

            <Footer lang={lang} dictionary={dictionary} />
        </div>
    );
}
