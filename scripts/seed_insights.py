import os
from supabase import create_client, Client
from dotenv import load_dotenv

# Load environment variables
load_dotenv('frontend/.env.local')

url = os.environ.get('NEXT_PUBLIC_SUPABASE_URL')
key = os.environ.get('SUPABASE_SERVICE_ROLE_KEY')

if not url or not key:
    print("Supabase credentials not found in frontend/.env.local")
    exit(1)

supabase: Client = create_client(url, key)

# Article data
articles = [
    {
        "slug": "ia-nao-e-oraculo-parceiro",
        "title_en": "AI is not an Oracle. It is a Partner. And partners need limits.",
        "title_pt": "IA não é oráculo. É parceiro. E parceiro precisa de limites.",
        "title_es": "A IA no es un Oráculo. Es um Socio. Y los socios necesitan límites.",
        "summary_en": "Why generative AI is a powerful tool but requires human responsibility and context.",
        "summary_pt": "Por que a IA generativa é uma ferramenta poderosa, mas exige responsabilidade e contexto humano.",
        "summary_es": "Por qué la IA generativa es una herramienta poderosa, mas exige responsabilidad y contexto humano.",
        "content_pt": """<h2>A Era da Plausibilidade vs. Responsabilidade</h2><p>A gente está vivendo uma fase curiosa: nunca tivemos tanta informação… e, ao mesmo tempo, nunca foi tão fácil se enganar com informação.</p><p>Uso IA todos os dias. Gosto. Acelera. Entrega insight. Mas tem uma coisa que eu aprendi rápido e quero deixar registrada aqui:</p><blockquote><strong>IA é treinada pra ser plausível. O ser humano é treinado pra ser responsável. São coisas diferentes.</strong></blockquote><h3>Onde isso pode dar errado?</h3><p>A IA te dá a resposta “que faz sentido”. O humano tem que perguntar: “onde isso pode dar errado?”</p><p>E essa é, pra mim, a pergunta mais importante que um profissional sério deve fazer pra uma IA: <strong>“O que você NÃO está vendo / não consegue garantir nessa resposta?”</strong></p><p>Porque aí:</p><ul><li>você revela o ponto cego do modelo;</li><li>você lembra que contexto não está nos dados;</li><li>e você evita decisão ruim vestida de resposta bonita.</li></ul><h3>Contexto em Real Estate e Finanças</h3><p>E por que isso é relevante pra negócio, finanças e real estate? Porque erro de contexto em finanças custa dinheiro. IA não sabe que o investidor está mais avesso a risco esse mês. IA não sabe que o sócio brigou ontem. IA não sabe que o banco mudou a linha de crédito na segunda-feira.</p><p>Quem sabe disso é gente. Gente que está na operação. Gente que olha relatório, mas também olha no olho.</p><h3>Método EA Financial Advisory</h3><p>IA boa não substitui profissional sério. IA boa potencializa profissional sério. IA ruim é a que responde tudo. IA boa é a que diz onde pode estar errada.</p><p>Na <strong>EA Financial Advisory</strong>, isso pra nós não é frase de efeito. É método. A gente usa IA pra acelerar análise, cenários e relatórios — mas a decisão e a responsabilidade continuam humanas. Porque cliente não paga por chute bem escrito; paga por governança, contexto e accountability.</p><p>Se você está usando IA na sua empresa e não está perguntando “onde isso quebra?”, você não está fazendo transformação digital. Você só está terceirizando o erro.</p>""",
        "content_en": """<h2>The Era of Plausibility vs. Responsibility</h2><p>We are living in a curious phase: we have never had so much information... and, at the same time, it has never been so easy to be deceived by information.</p><p>I use AI every day. I like it. It accelerates. It delivers insight. But there is one thing I learned quickly and want to record here:</p><blockquote><strong>AI is trained to be plausible. Humans are trained to be responsible. These are different things.</strong></blockquote><h3>Where can this go wrong?</h3><p>AI gives you the answer "that makes sense." The human has to ask: "where can this go wrong?"</p><p>And that is, for me, the most important question a serious professional should ask an AI: <strong>"What are you NOT seeing / cannot guarantee in this response?"</strong></p><p>Because then:<ul><li>you reveal the model's blind spot;</li><li>you remember that context is not in the data;</li><li>and you avoid a bad decision dressed as a pretty answer.</li></ul></p><h3>Context in Real Estate and Finance</h3><p>And why is this relevant to business, finance, and real estate? Because context errors in finance cost money. AI doesn't know the investor is more risk-averse this month. AI doesn't know the partners had a disagreement yesterday. AI doesn't know the bank changed the credit line on Monday.</p><p>People know this. People who are in the operation. People who look at reports, but also look in the eye.</p><h3>EA Financial Advisory Method</h3><p>Good AI doesn't replace a serious professional. Good AI empowers a serious professional. Bad AI is the one that answers everything. Good AI is the one that says where it might be wrong.</p>""",
        "category": "Tech",
        "read_time_minutes": 5,
        "is_premium": False,
        "image_url": "/images/blog/ai_partner_insight.png"
    },
    {
        "slug": "estruturacao-financeira-real-estate",
        "title_en": "Financial Structuring: The Gap Between Profit and Loss",
        "title_pt": "Estruturação Financeira: O Diferencial entre Lucro e Prejuízo",
        "title_es": "Estructuración Financiera: La Diferencia entre Lucro y Pérdida",
        "summary_en": "How professional capital structuring can save a real estate project from high interest and low margins.",
        "summary_pt": "Como a estruturação profissional de capital pode salvar um projeto imobiliário de juros altos e margens baixas.",
        "summary_es": "Cómo la estructuración profesional de capital puede salvar un proyecto inmobiliario de intereses altos.",
        "content_pt": "<h2>A Arte de Alavancar com Segurança</h2><p>No desenvolvimento imobiliário, o lucro muitas vezes não está na venda, mas na compra e na forma como o capital é estruturado. Na EA Financial Advisory, vemos que a diferença entre um projeto que retorna 25% de TIR e um que estagna em 12% muitas vezes reside na eficiência do Capital Stack.</p><h3>Equity vs. Debt</h3><p>Encontrar o equilíbrio certo entre o aporte próprio e o financiamento de construção (Construction Loan) é crítico. Uma alavancagem excessiva em momentos de juros voláteis pode asfixiar o fluxo de caixa, enquanto o excesso de equity reduz a rentabilidade do investidor.</p>",
        "content_en": "<h2>The Art of Safe Leveraging</h2><p>In real estate development, profit is often not in the sale, but in the purchase and the way capital is structured. At EA Financial Advisory, we see that the difference between a project returning 25% IRR and one stagnating at 12% often lies in Capital Stack efficiency.</p>",
        "category": "Investment",
        "read_time_minutes": 7,
        "is_premium": True,
        "image_url": "/images/blog/blog_finance_insight.png"
    },
    {
        "slug": "maximizar-gdv-mix-unidades",
        "title_en": "Maximizing GDV: The Science of Unit Mix",
        "title_pt": "Maximizar o GDV: A Ciência do Mix de Unidades",
        "title_es": "Maximizar el GDV: La Ciencia del Mix de Unidades",
        "summary_en": "Why choosing the right typology (beds/baths) is the most critical decision in early feasibility.",
        "summary_pt": "Por que escolher a tipologia certa é a decisão mais crítica na fase inicial da viabilidade.",
        "summary_es": "Por qué elegir la tipología correcta es la decisión más crítica en la fase inicial de viabilidad.",
        "content_pt": "<h2>O Produto Certo para o Mercado Certo</h2><p>Muitos incorporadores se apaixonam pelo projeto arquitetônico antes de validar a absorção do mercado. O segredo de um GDV (Gross Development Value) saudável está na sintonia fina entre o que o mercado local deseja e o que a legislação permite construir.</p><h3>Dados sobre Intuição</h3><p>O uso de dados demográficos — como idade média e renda familiar da região — deve ditar se o terreno deve receber casas de 3 ou 4 dormitórios.</p>",
        "content_en": "<h2>The Right Product for the Right Market</h2><p>Many developers fall in love with the architectural design before validating market absorption. The secret to a healthy GDV lies in the fine-tuning between what the local market wants and what the legislation allows to be built.</p>",
        "category": "Market",
        "read_time_minutes": 6,
        "is_premium": False,
        "image_url": "/images/blog/blog_real_estate_insight.png"
    }
]

# Delete placeholders
placeholder_slugs = ['ai-real-estate-2026', 'miami-luxury-market-trends', 'construction-costs-stabilization']
for s in placeholder_slugs:
    supabase.table('insights').delete().eq('slug', s).execute()

# Upsert articles
for article in articles:
    result = supabase.table('insights').upsert(article, on_conflict='slug').execute()
    print(f"Upserted: {article['slug']}")

print("Done!")
