-- Contato do responsável pelo animal (usado no botão "Chamar no WhatsApp")
-- Rodar no SQL Editor do Supabase ANTES de fazer o merge do PR front/contato-doador.
-- As colunas ficam opcionais para não quebrar os animais que já estão cadastrados;
-- o formulário é que obriga o preenchimento nos cadastros novos.

alter table public.animais
  add column if not exists nome_contato text,
  add column if not exists whatsapp_contato text;

-- whatsapp_contato é salvo só com dígitos: 55 + DDD + número (ex.: 5511999999999)
