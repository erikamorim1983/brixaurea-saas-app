const fs = require('fs');
const path = require('path');

// Basic env parser
const env = {};
const envPath = path.join(__dirname, '..', 'frontend', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
envContent.split('\n').forEach(line => {
    const match = line.match(/^([^#\s][^=]+)=(.*)$/);
    if (match) {
        env[match[1]] = match[2].trim();
    }
});

const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
    console.error('Credentials not found');
    process.exit(1);
}

const articles = [
    {
        slug: "ia-nao-e-oraculo-parceiro",
        title_en: "AI is not an Oracle. It is a Partner. And partners need limits.",
        title_pt: "IA não é oráculo. É parceiro. E parceiro precisa de limites.",
        title_es: "A IA no es un Oráculo. Es um Socio. Y los socios necesitan límites.",
        summary_en: "Why generative AI is a powerful tool but requires human responsibility and context.",
        summary_pt: "Por que a IA generativa é uma ferramenta poderosa, mas exige responsabilidade e contexto humano.",
        summary_es: "Por qué la IA generativa es una herramienta poderosa, mas exige responsabilidad y contexto humano.",
        content_pt: `<h2>A Era da Plausibilidade vs. Responsabilidade</h2><p>A gente está vivendo uma fase curiosa: nunca tivemos tanta informação… e, ao mesmo tempo, nunca foi tão fácil se enganar com informação.</p><p>Uso IA todos os dias. Gosto. Acelera. Entrega insight. Mas tem uma coisa que eu aprendi rápido e quero deixar registrada aqui:</p><blockquote><strong>IA é treinada pra ser plausível. O ser humano é treinado pra ser responsável. São coisas diferentes.</strong></blockquote><h3>Onde isso pode dar errado?</h3><p>A IA te dá a resposta “que faz sentido”. O humano tem que perguntar: “onde isso pode dar errado?”</p><p>E essa é, pra mim, a pergunta mais importante que um profissional sério deve fazer pra uma IA: <strong>“O que você NÃO está vendo / não consegue garantir nessa resposta?”</strong></p><p>Porque aí:</p><ul><li>você revela o ponto cego do modelo;</li><li>você lembra que contexto não está nos dados;</li><li>e você evita decisão ruim vestida de resposta bonita.</li></ul><h3>Contexto em Real Estate e Finanças</h3><p>E por que isso é relevante pra negócio, finanças e real estate? Porque erro de contexto em finanças custa dinheiro. IA não sabe que o investidor está mais avesso a risco esse mês. IA não sabe que o sócio brigou ontem. IA não sabe que o banco mudou a linha de crédito na segunda-feira.</p><p>Quem sabe disso é gente. Gente que está na operação. Gente que olha relatório, mas também olha no olho.</p><h3>Método EA Financial Advisory</h3><p>IA boa não substitui profissional sério. IA boa potencializa profissional sério. IA ruim é a que responde tudo. IA boa é a que diz onde pode estar errada. Agora essa é a nossa filosofia na <strong>EA Financial Advisory</strong>.</p><p>A gente usa IA pra acelerar análise, cenários e relatórios — mas a decisão e a responsabilidade continuam humanas. Porque cliente não paga por chute bem escrito; paga por governança, contexto e accountability.</p><p>Se você está usando IA na sua empresa e não está perguntando “onde isso quebra?”, você não está fazendo transformação digital. Você só está terceirizando o erro.</p>`,
        content_en: `<h2>The Era of Plausibility vs. Responsibility</h2><p>AI is trained to be plausible, humans are trained to be responsible. Good AI empowers professional experts but does not replace them.</p>`,
        category: "Tech",
        read_time_minutes: 5,
        is_premium: false,
        image_url: "/images/blog/ai_partner_insight.png"
    },
    {
        slug: "estruturacao-financeira-real-estate",
        title_en: "Financial Structuring: The Gap Between Profit and Loss",
        title_pt: "Estruturação Financeira: O Diferencial entre Lucro e Prejuízo",
        title_es: "Estructuración Financiera: La Diferencia entre Lucro y Pérdida",
        summary_en: "How professional capital structuring can save a real estate project from high interest and low margins.",
        summary_pt: "Como a estruturação profissional de capital pode salvar um projeto imobiliário de juros altos e margens baixas.",
        summary_es: "Cómo la estructuración profesional de capital puede salvar un proyecto inmobiliario de intereses altos.",
        content_pt: "<h2>A Arte de Alavancar com Segurança</h2><p>No desenvolvimento imobiliário, o lucro muitas vezes não está na venda, mas na compra e na forma como o capital é estruturado...</p>",
        category: "Investment",
        read_time_minutes: 7,
        is_premium: true,
        image_url: "/images/blog/blog_finance_insight.png"
    },
    {
        slug: "maximizar-gdv-mix-unidades",
        title_en: "Maximizing GDV: The Science of Unit Mix",
        title_pt: "Maximizar o GDV: A Ciência do Mix de Unidades",
        title_es: "Maximizar el GDV: La Ciência del Mix de Unidades",
        summary_en: "Why choosing the right typology (beds/baths) is the most critical decision in early feasibility.",
        summary_pt: "Por que escolher a tipologia certa é a decisão mais crítica na fase inicial da viabilidade.",
        summary_es: "Por qué elegir la tipología correcta es la decisión mais crítica na fase inicial de viabilidade.",
        content_pt: "<h2>O Produto Certo para o Mercado Certo</h2><p>Muitos incorporadores se apaixonam pelo projeto arquitetônico antes de validar a absorção do mercado...</p>",
        category: "Market",
        read_time_minutes: 6,
        is_premium: false,
        image_url: "/images/blog/blog_real_estate_insight.png"
    }
];

async function run() {
    for (const article of articles) {
        const res = await fetch(`${url}/rest/v1/insights?slug=eq.${article.slug}`, {
            method: 'POST',
            headers: {
                'apikey': key,
                'Authorization': `Bearer ${key}`,
                'Content-Type': 'application/json',
                'Prefer': 'resolution=merge-duplicates'
            },
            body: JSON.stringify(article)
        });
        if (res.ok) {
            console.log(`Success: ${article.slug}`);
        } else {
            console.error(`Error ${article.slug}:`, await res.text());
        }
    }
}

run();
