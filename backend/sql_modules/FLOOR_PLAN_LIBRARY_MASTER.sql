-- =====================================================
-- FLOOR PLAN LIBRARY: MASTER MIGRATION SCRIPT
-- =====================================================
-- Purpose: Execute all floor plan library migrations in order
-- Author: Erik @ BrixAurea
-- Date: 2026-01-01
-- =====================================================
-- 
-- ORDEM DE EXECUÇÃO:
-- 1. Property Categories (13)
-- 2. Property Subtypes (14)
-- 3. Floor Plan Library (15)
-- 4. Units Mix Integration (16)
--
-- COMO EXECUTAR:
-- Execute cada arquivo SQL em ordem no Supabase SQL Editor
-- OU execute este arquivo completo
--
-- =====================================================

\echo '=========================================='
\echo 'FLOOR PLAN LIBRARY - MASTER MIGRATION'
\echo '=========================================='
\echo ''

\echo '1/4: Creating property_categories table...'
\i '13_property_categories.sql'
\echo '✓ Property categories created'
\echo ''

\echo '2/4: Creating property_subtypes table...'
\i '14_property_subtypes.sql'
\echo '✓ Property subtypes created'
\echo ''

\echo '3/4: Creating floor_plan_library table...'
\i '15_floor_plan_library.sql'
\echo '✓ Floor plan library created'
\echo ''

\echo '4/4: Updating units_mix table...'
\i '16_units_mix_floor_plan_integration.sql'
\echo '✓ Units mix integration complete'
\echo ''

\echo '=========================================='
\echo 'MIGRATION COMPLETE! ✅'
\echo '=========================================='
\echo ''
\echo 'Summary:'
\echo '- 6 Property Categories'
\echo '- 50+ Property Subtypes'
\echo '- Floor Plan Library (private per user)'
\echo '- Units Mix integration'
\echo ''
\echo 'Next Steps:'
\echo '1. Verify data in Supabase'
\echo '2. Test RLS policies'
\echo '3. Proceed to UI implementation'
\echo ''
