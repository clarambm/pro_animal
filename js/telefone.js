// js/telefone.js
// Funções para validar e formatar números de WhatsApp brasileiros.

// Recebe o que a pessoa digitou e devolve só dígitos no formato
// usado pelo wa.me: 55 + DDD + número (ex.: "5511999999999").
// Devolve null se o número não for válido.
export function normalizarWhatsApp(valor) {
  let digitos = String(valor ?? '').replace(/\D/g, '');

  // Tira o código do país, se a pessoa digitou
  if ((digitos.length === 12 || digitos.length === 13) && digitos.startsWith('55')) {
    digitos = digitos.slice(2);
  }

  // Tira o zero de discagem (ex.: 011...)
  if ((digitos.length === 11 || digitos.length === 12) && digitos.startsWith('0')) {
    digitos = digitos.slice(1);
  }

  const ddd = digitos.slice(0, 2);
  const numero = digitos.slice(2);

  // DDD sem zero; celular com 9 dígitos começando em 9, ou fixo com 8 dígitos
  const dddValido = /^[1-9][1-9]$/.test(ddd);
  const numeroValido = /^9\d{8}$/.test(numero) || /^[2-8]\d{7}$/.test(numero);

  return dddValido && numeroValido ? `55${ddd}${numero}` : null;
}

// Deixa o número legível: "(11) 99999-9999".
// Se não for válido, devolve o texto como a pessoa digitou.
export function formatarWhatsApp(valor) {
  const normalizado = normalizarWhatsApp(valor);
  if (!normalizado) return String(valor ?? '').trim();

  const ddd = normalizado.slice(2, 4);
  const numero = normalizado.slice(4);
  const meio = numero.length === 9 ? 5 : 4;

  return `(${ddd}) ${numero.slice(0, meio)}-${numero.slice(meio)}`;
}
