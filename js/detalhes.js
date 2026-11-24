
import { supabase } from './supabase.js';
import { normalizarWhatsApp } from './telefone.js';

const container = document.getElementById('detalhe-animal');
const idAnimal = new URLSearchParams(window.location.search).get('id');

const legendas = {
  especie: { cachorro: 'Cão', gato: 'Gato' },
  porte: { pequeno: 'Pequeno', medio: 'Médio', grande: 'Grande' },
  sexo: { macho: 'Macho', femea: 'Fêmea' },
  idade: { filhote: 'Filhote', adulto: 'Adulto', idoso: 'Idoso' }
};

function escaparHtml(valor) {
  return String(valor ?? '').replace(/[&<>"']/g, caractere => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[caractere]);
}

function rotulo(tipo, valor) {
  const texto = String(valor ?? '').trim();
  if (!texto) return 'Não informado';

  return escaparHtml(
    legendas[tipo]?.[texto.toLowerCase()] ?? texto
  );
}

function formatarTelefone(valor) {
  const normalizado = normalizarWhatsApp(valor);

  if (!normalizado) {
    return valor ? escaparHtml(valor) : 'Não informado';
  }

  const numero = normalizado.slice(2);
  const ddd = numero.slice(0, 2);
  const restante = numero.slice(2);

  if (restante.length === 9) {
    return `(${ddd}) ${restante.slice(0, 5)}-${restante.slice(5)}`;
  }

  return `(${ddd}) ${restante.slice(0, 4)}-${restante.slice(4)}`;
}

function iconeWhatsapp() {
  return `
    <svg viewBox="0 0 24 24" fill="none"
      stroke="currentColor" stroke-width="1.9"
      stroke-linecap="round" stroke-linejoin="round"
      aria-hidden="true">
      <path d="M20.2 11.7a8.2 8.2 0 0 1-11.9 7.2L3 20.4l1.5-5.1a8.2 8.2 0 1 1 15.7-3.6Z"/>
      <path d="M9.2 8.1c-.2-.4-.4-.4-.7-.4-.3 0-.6.1-.8.4-.4.4-.7.9-.6 1.6.2 1.8 2.5 4.7 5.1 5.8 1.8.8 2.6.7 3.2.2.4.8-1.1.6-1.4-.1-.2-.5-.3-.9-.5l-1.3-.6c-.2-.1-.4 0-.5.2l-.6.7c-.2.2-.4.2-.7.1-1.1-.5-2-1.3-2.7-2.4-.2-.3-.2-.4 0-.6l.5-.6c.1-.2.1-.4 0-.6l-.6-1.9Z"/>
    </svg>
  `;
}

function iconeAviso() {
  return `
    <svg viewBox="0 0 24 24" fill="none"
      stroke="currentColor" stroke-width="1.8"
      stroke-linecap="round" stroke-linejoin="round"
      aria-hidden="true">
      <circle cx="12" cy="12" r="9"/>
      <path d="M12 7.5v5.5M12 16.5h.01"/>
    </svg>
  `;
}

function renderizarAnimal(animal) {
  const nomeOriginal = String(animal.nome ?? '').trim() || 'Animal';
  const nome = escaparHtml(nomeOriginal);

  const contato = escaparHtml(
    String(animal.nome_contato ?? '').trim() || 'Não informado'
  );

  const whatsapp = normalizarWhatsApp(animal.whatsapp_contato);
  const telefone = formatarTelefone(animal.whatsapp_contato);

  const descricao = escaparHtml(
    String(animal.descricao ?? '').trim() ||
    'Nenhuma descrição informada.'
  );

  const mensagem = encodeURIComponent(
    `Olá! Vi o anúncio de ${nomeOriginal} no site ProAnimal e gostaria de saber mais sobre a adoção.`
  );

  const urlWhatsapp = whatsapp
    ? `https://wa.me/${whatsapp}?text=${mensagem}`
    : null;

  const fotoValida =
    typeof animal.foto_url === 'string' &&
    /^https?:\/\//i.test(animal.foto_url);

  const foto = fotoValida
    ? `<img src="${escaparHtml(animal.foto_url)}"
        alt="Foto de ${nome}"
        class="detalhe-foto"
        loading="eager">`
    : `<div class="detalhe-sem-foto">
        Foto indisponível
      </div>`;

  container.innerHTML = `
    <article class="detalhe-card">
      ${foto}

      <div class="detalhe-info">
        <h1>${nome}</h1>

        <dl class="detalhe-atributos">
          <div class="detalhe-atributo">
            <dt>Espécie</dt>
            <dd>${rotulo('especie', animal.especie)}</dd>
          </div>

          <div class="detalhe-atributo">
            <dt>Porte</dt>
            <dd>${rotulo('porte', animal.porte)}</dd>
          </div>

          <div class="detalhe-atributo">
            <dt>Sexo</dt>
            <dd>${rotulo('sexo', animal.sexo)}</dd>
          </div>

          <div class="detalhe-atributo">
            <dt>Idade</dt>
            <dd>${rotulo('idade', animal.idade)}</dd>
          </div>
        </dl>

        <section class="detalhe-sobre">
          <h2>SOBRE O BICHINHO</h2>
          <p>${descricao}</p>
        </section>

        <section class="detalhe-contato">
          <h2>CONTATO DO RESPONSÁVEL</h2>

          <p>
            Anunciado por: <strong>${contato}</strong>
          </p>

          <p>
            Telefone: <strong>${telefone}</strong>
          </p>

          <p class="detalhe-aviso">
            ${iconeAviso()}
            <span>
              Importante: O contato é direto com quem está
              doando o animal. O ProAnimal não realiza
              triagens neste caso.
            </span>
          </p>

          ${urlWhatsapp ? `
            <a
              href="${urlWhatsapp}"
              class="btn-whatsapp"
              aria-label="Chamar o responsável por ${nome} no WhatsApp"
            >
              ${iconeWhatsapp()}
              <span>Chamar no WhatsApp</span>
            </a>
          ` : `
            <p class="detalhe-contato-indisponivel">
              WhatsApp não cadastrado ou inválido.
              Peça à ONG que atualize este anúncio.
            </p>
          `}
        </section>
      </div>
    </article>
  `;
}

async function carregarAnimal() {
  if (!idAnimal) {
    container.innerHTML = `
      <p class="vazio">
        Animal não especificado.
        <a href="adocao.html">Voltar ao catálogo</a>
      </p>
    `;
    return;
  }

  try {
    const { data, error } = await supabase
      .from('animais')
      .select('*')
      .eq('id', idAnimal)
      .single();

    if (error) throw error;

    if (!data) {
      throw new Error('Animal não encontrado');
    }

    renderizarAnimal(data);

  } catch (erro) {
    console.error('Erro ao buscar animal:', erro);

    container.innerHTML = `
      <p class="vazio">
        Não foi possível carregar este animal.
        <a href="adocao.html">Voltar ao catálogo</a>
      </p>
    `;
  }
}

carregarAnimal();
