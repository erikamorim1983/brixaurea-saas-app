-- DEBUG: Verificar estado dos cenários e unidades
-- Execute este SQL no Supabase Dashboard > SQL Editor

-- 1. Ver todos os cenários deste projeto
SELECT 
    id,
    name,
    scenario_type,
    created_at
FROM financial_scenarios 
WHERE project_id = '7c73c299-9410-471d-b203-7711e3f4e4d7'
ORDER BY created_at;

-- 2. Ver todas as unidades deste projeto (por cenário)
SELECT 
    u.id,
    u.scenario_id,
    fs.name as scenario_name,
    fs.scenario_type,
    u.model_name,
    u.unit_count,
    u.avg_price,
    u.area_sqft
FROM units_mix u
JOIN financial_scenarios fs ON u.scenario_id = fs.id
WHERE fs.project_id = '7c73c299-9410-471d-b203-7711e3f4e4d7'
ORDER BY fs.created_at, u.created_at;

-- 3. Contar unidades por cenário
SELECT 
    fs.name as scenario_name,
    fs.scenario_type,
    COUNT(u.id) as unit_count,
    SUM(u.unit_count) as total_units
FROM financial_scenarios fs
LEFT JOIN units_mix u ON u.scenario_id = fs.id
WHERE fs.project_id = '7c73c299-9410-471d-b203-7711e3f4e4d7'
GROUP BY fs.id, fs.name, fs.scenario_type
ORDER BY fs.created_at;
