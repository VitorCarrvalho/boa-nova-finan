-- Inserir categorias de serviço se não existirem
INSERT INTO service_categories (name, is_active) 
SELECT 'Arquitetura e Construção', true
WHERE NOT EXISTS (SELECT 1 FROM service_categories WHERE name = 'Arquitetura e Construção');

INSERT INTO service_categories (name, is_active) 
SELECT 'Educação', true
WHERE NOT EXISTS (SELECT 1 FROM service_categories WHERE name = 'Educação');

INSERT INTO service_categories (name, is_active) 
SELECT 'Saúde e Bem-estar', true
WHERE NOT EXISTS (SELECT 1 FROM service_categories WHERE name = 'Saúde e Bem-estar');

INSERT INTO service_categories (name, is_active) 
SELECT 'Tecnologia', true
WHERE NOT EXISTS (SELECT 1 FROM service_categories WHERE name = 'Tecnologia');

INSERT INTO service_categories (name, is_active) 
SELECT 'Serviços Gerais', true
WHERE NOT EXISTS (SELECT 1 FROM service_categories WHERE name = 'Serviços Gerais');

-- Inserir um prestador de serviço de exemplo para teste
WITH category_ref AS (
  SELECT id FROM service_categories WHERE name = 'Tecnologia' LIMIT 1
),
congregation_ref AS (
  SELECT id FROM congregations WHERE name LIKE '%Central%' LIMIT 1
)
INSERT INTO service_providers (
  slug,
  name,
  description,
  experience_years,
  category_id,
  instagram,
  linkedin,
  website,
  whatsapp,
  email,
  city,
  state,
  congregation_id,
  congregation_name,
  photo_url,
  status,
  terms_accepted
)
SELECT 
  'joao-silva-dev',
  'João Silva',
  'Desenvolvedor Full Stack especializado em React, Node.js e bancos de dados. Experiência em sistemas para igrejas e organizações.',
  5,
  category_ref.id,
  '@joaosilvadev',
  'linkedin.com/in/joaosilva',
  'joaosilva.dev',
  '5521999887766',
  'joao@exemplo.com',
  'Rio de Janeiro',
  'RJ',
  congregation_ref.id,
  'Congregação Central',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
  'approved',
  true
FROM category_ref, congregation_ref
WHERE NOT EXISTS (
  SELECT 1 FROM service_providers WHERE slug = 'joao-silva-dev'
);