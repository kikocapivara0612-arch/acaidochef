/* ============================================================
   AÇAÍ DO CHEF — script.js
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ===================== ANIMAÇÃO AO ROLAR ===================== */
  const elementos = document.querySelectorAll(
    '.sobre-card, .tamanho-card, .cardapio-bloco, .adicional-card, .depoimento-card, .contato-card'
  );

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    elementos.forEach((el) => {
      el.classList.add('reveal');
      observer.observe(el);
    });
  }


  /* ===================== MENU MOBILE ===================== */
  const menuToggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.nav');

  if (menuToggle && nav) {
    const fecharMenu = () => {
      nav.classList.remove('active');
      menuToggle.setAttribute('aria-expanded', 'false');
      menuToggle.setAttribute('aria-label', 'Abrir menu');
    };

    menuToggle.addEventListener('click', () => {
      const aberto = nav.classList.toggle('active');
      menuToggle.setAttribute('aria-expanded', String(aberto));
      menuToggle.setAttribute('aria-label', aberto ? 'Fechar menu' : 'Abrir menu');
    });

    nav.querySelectorAll('a').forEach((link) => link.addEventListener('click', fecharMenu));

    document.addEventListener('click', (e) => {
      if (!nav.contains(e.target) && !menuToggle.contains(e.target) && nav.classList.contains('active')) {
        fecharMenu();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && nav.classList.contains('active')) fecharMenu();
    });
  }


  /* =====================================================================
     ██  MONTE SEU AÇAÍ — CONFIGURADOR  ██
  ===================================================================== */

  const NUMERO_WHATSAPP = '5517988134154';

  /* ═══════════════════════════════════════════════════════════════
     ▼▼▼  ÁREA EDITÁVEL  ▼▼▼
     ⚠️ Os nomes devem bater EXATAMENTE com o HTML:
        data-grupo="cremes"   → CONFIG.limites['500ml'].cremes
        data-nome="Prestígio" → CONFIG.precos.cremes['Prestígio']
     ═══════════════════════════════════════════════════════════════ */
  const CONFIG = {

    /* 1️⃣ COTA GRÁTIS POR COPO — 0 = cobrado desde o 1º item */
    limites: {
      '300ml': { sorvetes: 2, acompanhamentos: 3, frutas: 0, cremes: 0 },
      '500ml': { sorvetes: 2, acompanhamentos: 4, frutas: 0, cremes: 0 },
      '700ml': { sorvetes: 2, acompanhamentos: 4, frutas: 0, cremes: 0 }
    },

    /* 2️⃣ PREÇO DE CADA ITEM  ← EDITE AQUI */
    precos: {
      sorvetes: {},

      acompanhamentos: {
        'Leite condensado':       2.00,
        'Leite ninho':            2.00,
        'Paçoca':                 2.00,
        'Granola':                2.00,
        'Confete':                2.00,
        'Granulado Colorido':     2.00,
        'Ovomaltine':             2.00,
        'Farinha láctea':         2.00,
        'Chocoboll':              2.00,
        'Amendoim':               2.00,
        'Gotas de Chocolate':     2.00,
        'Mel':                    2.00,
        'Kiwi':                   3.00,
        'Morango':                3.00,
        'Banana':                 2.00,
        'Uva':                    2.00,
        'Calda de Chocolate':     2.00,
        'Calda de Morango':       2.00,
        'Calda de Beijos (Fini)': 2.00
      },

      frutas: {
        'Morango': 3.00,
        'Banana':  2.00,
        'Kiwi':    3.00,
        'Uva':     2.00      /* ← era 3.00, agora bate com Acompanhamentos */
      },

      cremes: {
        'Ninho':              5.00,
        'Nutella':            4.00,
        'Creme de Paçoca':    4.00,
        'Prestígio':          4.00,
        'Trufa ao Leite':     4.00,
        'Chocowaffer Branco': 4.00
      }
    },

    /* 3️⃣ PREÇO PADRÃO (item fora da tabela acima) */
    precoPadrao: {
      sorvetes: 0.00,
      acompanhamentos: 2.00,
      frutas: 3.00,
      cremes: 4.00
    },

    /* 4️⃣ GRUPOS QUE TRAVAM NA COTA */
    rigidos: ['sorvetes'],

    /* 5️⃣ RÓTULOS */
    rotulos: {
      sorvetes: 'sabor',
      acompanhamentos: 'acompanhamento',
      frutas: 'fruta',
      cremes: 'creme'
    },
    titulos: {
      sorvetes: 'Sabores de Sorvete',
      acompanhamentos: 'Acompanhamentos',
      frutas: 'Frutas',
      cremes: 'Cremes'
    }
  };
  /* ═══════════════════════════════════════════════════════════════
     ▲▲▲  FIM DA ÁREA EDITÁVEL  ▲▲▲
     ═══════════════════════════════════════════════════════════════ */


  const grupoTamanho     = document.getElementById('grupo-tamanho');
  const resumoLinhas     = document.getElementById('resumo-linhas');
  const resumoValorTotal = document.getElementById('resumo-valor-total');
  const btnEnviarPedido  = document.getElementById('btn-enviar-pedido');
  const inputEndereco    = document.getElementById('input-endereco');
  const grupoPagamento   = document.getElementById('grupo-pagamento');
  const qtdMenos         = document.getElementById('qtd-menos');
  const qtdMais          = document.getElementById('qtd-mais');
  const qtdValorEl       = document.getElementById('qtd-valor');

  const QTD_MIN = 1;
  const QTD_MAX = 10;

  if (grupoTamanho && resumoLinhas && resumoValorTotal && btnEnviarPedido) {

    const pedido = { tamanho: null, grupos: {}, adicionais: new Map(), endereco: '', formaPagamento: null, quantidade: 1 };

    const listas = document.querySelectorAll('.tags-list[data-grupo]');
    listas.forEach((l) => { pedido.grupos[l.dataset.grupo] = []; });

    /* ---------- helpers ---------- */
    const formatarMoeda = (v) =>
      v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    const limiteDe = (grupo) => {
      if (!pedido.tamanho) return 0;
      const tabela = CONFIG.limites[pedido.tamanho.nome] || {};
      return tabela[grupo] || 0;
    };

    const ehRigido = (grupo) => CONFIG.rigidos.indexOf(grupo) > -1;

    /* Grupo sem cota grátis em nenhum tamanho */
    const semCota = (grupo) => {
      if (ehRigido(grupo)) return false;
      return Object.keys(CONFIG.limites)
        .every((tam) => !(CONFIG.limites[tam][grupo] > 0));
    };

    const precoDoItem = (grupo, nome) => {
      const tabela = (CONFIG.precos && CONFIG.precos[grupo]) || {};
      if (tabela[nome] !== undefined) return tabela[nome];
      return (CONFIG.precoPadrao && CONFIG.precoPadrao[grupo]) || 0;
    };

    /* ---------- cálculo dos itens cobrados ---------- */
    const calcularExtras = () => {
      let total = 0;
      const detalhes = [];

      for (const grupo in pedido.grupos) {
        if (ehRigido(grupo)) continue;

        const limite = limiteDe(grupo);

        /* slice(limite) respeita a ORDEM DE ESCOLHA */
        pedido.grupos[grupo].slice(limite).forEach((nome) => {
          const preco = precoDoItem(grupo, nome);
          if (preco > 0) {
            total += preco;
            detalhes.push(nome + ' (' + formatarMoeda(preco) + ')');
          }
        });
      }

      return { total, detalhes };
    };

    const calcularTotal = () => {
      let total = pedido.tamanho ? pedido.tamanho.preco : 0;
      pedido.adicionais.forEach((p) => { total += p; });
      total += calcularExtras().total;
      return total * pedido.quantidade;
    };

    /* ---------- quantidade de copos ---------- */
    const atualizarQuantidadeUI = () => {
      if (!qtdValorEl) return;
      qtdValorEl.textContent = String(pedido.quantidade);
      if (qtdMenos) qtdMenos.disabled = pedido.quantidade <= QTD_MIN;
      if (qtdMais)  qtdMais.disabled  = pedido.quantidade >= QTD_MAX;
    };

    /* ---------- aviso flutuante ---------- */
    let timerAviso;
    const avisar = (tag, msg) => {
      tag.classList.add('shake');
      setTimeout(() => tag.classList.remove('shake'), 320);

      let box = document.getElementById('aviso-limite');

      if (!box) {
        box = document.createElement('div');
        box.id = 'aviso-limite';
        box.setAttribute('role', 'status');
        box.setAttribute('aria-live', 'polite');
        box.style.cssText =
          'position:fixed;left:50%;bottom:24px;transform:translateX(-50%);' +
          'background:#2f064f;color:#fff;padding:.7rem 1.1rem;border-radius:999px;' +
          'font-weight:600;font-size:.9rem;z-index:9999;text-align:center;max-width:90vw;' +
          'box-shadow:0 8px 24px rgba(0,0,0,.25);transition:opacity .3s;';
        document.body.appendChild(box);
      }

      box.textContent = msg;
      box.style.opacity = '1';
      clearTimeout(timerAviso);
      timerAviso = setTimeout(() => { box.style.opacity = '0'; }, 2600);
    };

    /* ---------- estado visual das tags e contadores ---------- */
    const revalidarTags = () => {
      listas.forEach((lista) => {
        const grupo  = lista.dataset.grupo;
        const limite = limiteDe(grupo);
        const sel    = pedido.grupos[grupo];
        const livre  = semCota(grupo);

        lista.classList.toggle('bloqueado', !pedido.tamanho);

        lista.querySelectorAll('.tag-item').forEach((tag) => {
          const nome  = tag.dataset.nome;
          /* ✅ posição na ORDEM DE ESCOLHA, não na ordem do HTML */
          const ordem = sel.indexOf(nome);
          const on    = ordem > -1;
          const preco = precoDoItem(grupo, nome);

          tag.classList.toggle('selecionado', on);
          tag.setAttribute('aria-pressed', String(on));

          if (on) {
            /* os primeiros "limite" escolhidos são grátis */
            const paga = !ehRigido(grupo) && !livre && ordem >= limite && preco > 0;

            tag.classList.toggle('paga', paga);
            tag.classList.toggle('incluso', !paga && !ehRigido(grupo) && limite > 0);

            if (paga) {
              tag.dataset.extra = formatarMoeda(preco);
              delete tag.dataset.valor;
            } else {
              delete tag.dataset.extra;
              if (livre && preco > 0) tag.dataset.valor = formatarMoeda(preco);
              else delete tag.dataset.valor;
            }

            tag.disabled = false;

          } else {
            tag.classList.remove('paga', 'incluso');
            delete tag.dataset.extra;

            /* não escolhido volta a exibir o preço cheio */
            if (!ehRigido(grupo) && preco > 0) {
              tag.dataset.valor = formatarMoeda(preco);
            }

            tag.disabled = ehRigido(grupo) && sel.length >= limite;
          }
        });

        /* --- contador do bloco --- */
        const el = document.querySelector('[data-contador="' + grupo + '"]');
        if (!el) return;

        el.classList.remove('no-limite', 'excedeu');

        if (!pedido.tamanho) {
          el.textContent = 'Escolha o tamanho do copo para liberar as opções';
          return;
        }

        /* grupos sem cota grátis */
        if (livre) {
          if (!sel.length) {
            el.textContent = 'Cada item é cobrado à parte';
          } else {
            const soma = sel.reduce((acc, n) => acc + precoDoItem(grupo, n), 0);
            el.textContent = sel.length + ' selecionado(s) = ' + formatarMoeda(soma);
            el.classList.add('excedeu');
          }
          return;
        }

        const qtdExtras = Math.max(0, sel.length - limite);

        if (qtdExtras > 0) {
          const soma = sel.slice(limite).reduce((acc, n) => acc + precoDoItem(grupo, n), 0);
          el.textContent = soma > 0
            ? sel.length + ' de ' + limite + ' inclusos · ' + qtdExtras + ' extra(s) = ' + formatarMoeda(soma)
            : sel.length + ' de ' + limite + ' inclusos · ' + qtdExtras + ' extra(s)';
          el.classList.add('excedeu');

        } else if (sel.length === limite) {
          el.textContent = ehRigido(grupo)
            ? sel.length + ' de ' + limite + ' — cota completa'
            : sel.length + ' de ' + limite + ' — os próximos são cobrados à parte';
          el.classList.add('no-limite');

        } else {
          el.textContent = sel.length + ' de ' + limite + ' inclusos · restam ' + (limite - sel.length);
        }
      });
    };

    /* ---------- validação do pedido (habilita/desabilita envio) ---------- */
    const pedidoCompleto = () =>
      Boolean(pedido.tamanho) &&
      pedido.endereco.trim().length > 0 &&
      Boolean(pedido.formaPagamento);

    /* ---------- resumo ---------- */
    const atualizarResumo = () => {
      revalidarTags();
      resumoLinhas.innerHTML = '';

      if (!pedido.tamanho) {
        resumoLinhas.innerHTML =
          '<p class="resumo-vazio">Escolha o tamanho do seu açaí para começar.</p>';

      } else {
        const linhas = [];

        linhas.push('<b>Tamanho:</b> ' + pedido.tamanho.nome + ' — ' + formatarMoeda(pedido.tamanho.preco));

        for (const grupo in pedido.grupos) {
          const sel = pedido.grupos[grupo];
          if (!sel.length) continue;
          if (semCota(grupo)) continue;   /* aparece em "Itens cobrados" */

          const limite = limiteDe(grupo);
          const titulo = CONFIG.titulos[grupo] || grupo;

          if (!ehRigido(grupo) && sel.length > limite) {
            linhas.push('<b>' + titulo + ' (inclusos):</b> ' + sel.slice(0, limite).join(', '));
          } else {
            linhas.push('<b>' + titulo + ':</b> ' + sel.join(', '));
          }
        }

        const extras = calcularExtras();
        if (extras.detalhes.length) {
          linhas.push('<b>Itens cobrados:</b> ' + extras.detalhes.join(', '));
        }

        if (pedido.adicionais.size) {
          const lista = Array.from(pedido.adicionais.entries())
            .map(([nome, preco]) => nome + ' (' + formatarMoeda(preco) + ')')
            .join(', ');
          linhas.push('<b>Adicionais:</b> ' + lista);
        }

        if (pedido.quantidade > 1) {
          const valorUnitario = pedido.tamanho.preco + calcularExtras().total +
            Array.from(pedido.adicionais.values()).reduce((acc, p) => acc + p, 0);
          linhas.push('<b>Quantidade:</b> ' + pedido.quantidade + ' copos iguais a este (' +
            formatarMoeda(valorUnitario) + ' cada)');
        }

        if (pedido.formaPagamento) {
          linhas.push('<b>Pagamento:</b> ' + pedido.formaPagamento);
        }

        if (pedido.endereco.trim()) {
          linhas.push('<b>Endereço:</b> ' + pedido.endereco.trim());
        }

        resumoLinhas.innerHTML = linhas
          .map((l) => '<div class="resumo-linha">' + l + '</div>').join('');
      }

      resumoValorTotal.textContent = formatarMoeda(calcularTotal());
      btnEnviarPedido.disabled = !pedidoCompleto();
    };

    /* ---------- tamanho (escolha única) ---------- */
    grupoTamanho.querySelectorAll('.tamanho-card').forEach((card) => {

      const selecionar = () => {
        grupoTamanho.querySelectorAll('.tamanho-card').forEach((c) => {
          c.classList.remove('selecionado');
          c.setAttribute('aria-pressed', 'false');
        });

        card.classList.add('selecionado');
        card.setAttribute('aria-pressed', 'true');

        pedido.tamanho = {
          nome:  card.dataset.tamanho,
          preco: parseFloat(card.dataset.preco)
        };

        /* corta excesso nos grupos rígidos ao trocar de copo */
        for (const grupo in pedido.grupos) {
          if (ehRigido(grupo)) {
            pedido.grupos[grupo] = pedido.grupos[grupo].slice(0, limiteDe(grupo));
          }
        }

        atualizarResumo();
      };

      card.addEventListener('click', selecionar);
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); selecionar(); }
      });
    });

    /* ---------- tags dos grupos ---------- */
    listas.forEach((lista) => {
      const grupo = lista.dataset.grupo;

      lista.querySelectorAll('.tag-item').forEach((botao) => {
        botao.addEventListener('click', () => {

          if (!pedido.tamanho) {
            avisar(botao, 'Escolha primeiro o tamanho do copo');
            return;
          }

          const nome   = botao.dataset.nome;
          const sel    = pedido.grupos[grupo];
          const indice = sel.indexOf(nome);

          if (indice > -1) {
            sel.splice(indice, 1);

          } else {
            /* grupo rígido: trava na cota */
            if (ehRigido(grupo) && sel.length >= limiteDe(grupo)) {
              const rotulo = CONFIG.rotulos[grupo] || grupo;
              avisar(botao, 'Máximo de ' + limiteDe(grupo) + ' ' + rotulo + '(es). Remova um para trocar.');
              return;
            }

            /* excedeu a cota: informa o valor */
            if (!ehRigido(grupo) && !semCota(grupo) && sel.length >= limiteDe(grupo)) {
              const preco = precoDoItem(grupo, nome);
              if (preco > 0) avisar(botao, nome + ' entra como extra: +' + formatarMoeda(preco));
            }

            sel.push(nome);
          }

          atualizarResumo();
        });
      });
    });

    /* ---------- adicionais ---------- */
    document.querySelectorAll('.adicional-item').forEach((item) => {

      const alternar = () => {
        const nome  = item.dataset.nome;
        const preco = parseFloat(item.dataset.preco);
        const ativo = pedido.adicionais.has(nome);

        if (ativo) {
          pedido.adicionais.delete(nome);
          item.classList.remove('selecionado');
        } else {
          pedido.adicionais.set(nome, preco);
          item.classList.add('selecionado');
        }

        item.setAttribute('aria-pressed', String(!ativo));
        atualizarResumo();
      };

      item.addEventListener('click', alternar);
      item.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); alternar(); }
      });
    });

    /* ---------- quantidade de copos (botões +/-) ---------- */
    if (qtdMenos && qtdMais) {
      qtdMenos.addEventListener('click', () => {
        if (pedido.quantidade > QTD_MIN) {
          pedido.quantidade--;
          atualizarQuantidadeUI();
          atualizarResumo();
        }
      });

      qtdMais.addEventListener('click', () => {
        if (pedido.quantidade < QTD_MAX) {
          pedido.quantidade++;
          atualizarQuantidadeUI();
          atualizarResumo();
        } else {
          avisar(qtdMais, 'Para mais de ' + QTD_MAX + ' copos, fale direto com a gente pelo WhatsApp');
        }
      });
    }

    /* ---------- endereço de entrega ---------- */
    if (inputEndereco) {
      inputEndereco.addEventListener('input', () => {
        pedido.endereco = inputEndereco.value;
        if (pedido.endereco.trim()) inputEndereco.classList.remove('campo-invalido');
        atualizarResumo();
      });
    }

    /* ---------- forma de pagamento (escolha única) ---------- */
    if (grupoPagamento) {
      grupoPagamento.querySelectorAll('.forma-item').forEach((botao) => {
        botao.addEventListener('click', () => {
          grupoPagamento.querySelectorAll('.forma-item').forEach((b) => {
            b.classList.remove('selecionado');
            b.setAttribute('aria-pressed', 'false');
          });

          botao.classList.add('selecionado');
          botao.setAttribute('aria-pressed', 'true');
          pedido.formaPagamento = botao.dataset.forma;

          atualizarResumo();
        });
      });
    }

    /* ---------- envio para o WhatsApp ---------- */
    btnEnviarPedido.addEventListener('click', () => {
      if (!pedido.tamanho) return;

      /* validação final: endereço e forma de pagamento são obrigatórios */
      if (!pedido.endereco.trim()) {
        if (inputEndereco) {
          inputEndereco.classList.add('campo-invalido');
          inputEndereco.focus();
          avisar(inputEndereco, 'Informe o endereço de entrega');
        }
        return;
      }

      if (!pedido.formaPagamento) {
        if (grupoPagamento) avisar(grupoPagamento.querySelector('.forma-item'), 'Escolha a forma de pagamento');
        return;
      }

      const msg = [
        'Olá! Gostaria de fazer o seguinte pedido:',
        '',
        'Tamanho: ' + pedido.tamanho.nome + ' - ' + formatarMoeda(pedido.tamanho.preco)
      ];

      for (const grupo in pedido.grupos) {
        const sel = pedido.grupos[grupo];
        if (!sel.length) continue;

        const limite = limiteDe(grupo);
        const titulo = CONFIG.titulos[grupo] || grupo;

        if (semCota(grupo)) {
          msg.push(titulo + ': ' + sel.map((n) => {
            const p = precoDoItem(grupo, n);
            return p > 0 ? n + ' (' + formatarMoeda(p) + ')' : n;
          }).join(', '));

        } else if (!ehRigido(grupo) && sel.length > limite) {
          msg.push(titulo + ' inclusos: ' + sel.slice(0, limite).join(', '));
          msg.push(titulo + ' extras: ' + sel.slice(limite).map((n) => {
            const p = precoDoItem(grupo, n);
            return p > 0 ? n + ' (' + formatarMoeda(p) + ')' : n;
          }).join(', '));

        } else {
          msg.push(titulo + ': ' + sel.join(', '));
        }
      }

      if (pedido.adicionais.size) {
        msg.push('Adicionais: ' + Array.from(pedido.adicionais.entries())
          .map(([nome, preco]) => nome + ' (' + formatarMoeda(preco) + ')').join(', '));
      }

      if (pedido.quantidade > 1) {
        msg.push('', 'Quantidade: ' + pedido.quantidade + ' copos iguais a este pedido');
      }

      msg.push(
        '',
        'Total: ' + formatarMoeda(calcularTotal()),
        '',
        'Forma de pagamento: ' + pedido.formaPagamento,
        'Endereço para entrega: ' + pedido.endereco.trim()
      );

      window.open(
        'https://wa.me/' + NUMERO_WHATSAPP + '?text=' + encodeURIComponent(msg.join('\n')),
        '_blank', 'noopener'
      );
    });

    atualizarQuantidadeUI();
    atualizarResumo();
  }


  /* ===================== LINK ATIVO NO MENU ===================== */
  const secoes   = document.querySelectorAll('section[id]');
  const linksNav = document.querySelectorAll('.nav a[href^="#"]');

  if ('IntersectionObserver' in window && secoes.length && linksNav.length) {
    const navObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          linksNav.forEach((link) => {
            link.classList.toggle('active', link.getAttribute('href') === '#' + id);
          });
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });

    secoes.forEach((secao) => navObserver.observe(secao));
  }

});

/* ===== INÍCIO — ADIÇÃO COPO FONDUE ===== */
(function () {
  'use strict';

  var PRECO_FONDUE = 26.00;
  var WHATS = '5517988134154';

  var raiz = document.querySelector('.copo2-montagem');
  if (!raiz) return;

  var elLinhas = document.getElementById('copo2-linhas');
  var elTotal  = document.getElementById('copo2-valor-total');
  var elQtd    = document.getElementById('copo2-qtd-valor');
  var btnMenos = document.getElementById('copo2-qtd-menos');
  var btnMais  = document.getElementById('copo2-qtd-mais');
  var btnEnvia = document.getElementById('copo2-enviar');

  if (!elLinhas || !elTotal || !elQtd || !btnMenos || !btnMais || !btnEnvia) return;

  var estado = { cremes: [], frutas: [] };
  var quantidade = 1;

  function moeda(v) {
    return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  function rotulo(grupo, usados, max) {
    if (grupo === 'cremes') {
      return usados ? 'Creme escolhido: ' + estado.cremes[0] : 'Escolha 1 creme';
    }
    return usados
      ? usados + ' de ' + max + ' frutas escolhidas'
      : 'Escolha até ' + max + ' frutas';
  }

  function atualizar() {
    var grupos = raiz.querySelectorAll('[data-copo2-grupo]');

    for (var i = 0; i < grupos.length; i++) {
      var lista = grupos[i];
      var grupo = lista.getAttribute('data-copo2-grupo');
      var max = parseInt(lista.getAttribute('data-copo2-max'), 10) || 1;
      var sel = estado[grupo] || [];
      var cheio = sel.length >= max;

      var contador = raiz.querySelector('[data-copo2-contador="' + grupo + '"]');
      if (contador) contador.textContent = rotulo(grupo, sel.length, max);

      var itens = lista.querySelectorAll('.tag-item');
      for (var j = 0; j < itens.length; j++) {
        var marcado = itens[j].getAttribute('aria-pressed') === 'true';
        if (cheio && !marcado && max > 1) {
          itens[j].classList.add('copo2-travado');
        } else {
          itens[j].classList.remove('copo2-travado');
        }
      }
    }

    elLinhas.innerHTML = '';

    if (!estado.cremes.length && !estado.frutas.length) {
      var vazio = document.createElement('p');
      vazio.className = 'copo2-vazio';
      vazio.textContent = 'Escolha o creme para começar a montar.';
      elLinhas.appendChild(vazio);
    } else {
      linha('Copo Fondue', '300ml');
      if (estado.cremes.length) linha('Creme', estado.cremes.join(', '));
      if (estado.frutas.length) linha('Frutas', estado.frutas.join(', '));
    }

    elQtd.textContent = String(quantidade);
    elTotal.textContent = moeda(PRECO_FONDUE * quantidade);
    btnEnvia.disabled = estado.cremes.length === 0;
  }

  function linha(titulo, valor) {
    var div = document.createElement('div');
    div.className = 'copo2-linha';
    var a = document.createElement('span');
    a.textContent = titulo;
    var b = document.createElement('strong');
    b.textContent = valor;
    div.appendChild(a);
    div.appendChild(b);
    elLinhas.appendChild(div);
  }

  function alternar(botao, lista) {
    var grupo = lista.getAttribute('data-copo2-grupo');
    var max = parseInt(lista.getAttribute('data-copo2-max'), 10) || 1;
    var nome = botao.getAttribute('data-copo2-nome') || botao.textContent.trim();
    var sel = estado[grupo];
    if (!sel) return;

    var pos = sel.indexOf(nome);

    if (pos > -1) {
      sel.splice(pos, 1);
      botao.setAttribute('aria-pressed', 'false');
    } else {
      if (max === 1) {
        var todos = lista.querySelectorAll('.tag-item');
        for (var k = 0; k < todos.length; k++) {
          todos[k].setAttribute('aria-pressed', 'false');
        }
        sel.length = 0;
      } else if (sel.length >= max) {
        var bloco = lista.closest('.copo2-bloco');
        if (bloco) {
          bloco.classList.add('copo2-limite');
          setTimeout(function () { bloco.classList.remove('copo2-limite'); }, 380);
        }
        return;
      }
      sel.push(nome);
      botao.setAttribute('aria-pressed', 'true');
    }

    atualizar();
  }

  var listas = raiz.querySelectorAll('[data-copo2-grupo]');
  for (var n = 0; n < listas.length; n++) {
    (function (lista) {
      lista.addEventListener('click', function (ev) {
        var botao = ev.target.closest('.tag-item');
        if (botao && lista.contains(botao)) alternar(botao, lista);
      });
    })(listas[n]);
  }

  btnMenos.addEventListener('click', function () {
    if (quantidade > 1) { quantidade--; atualizar(); }
  });

  btnMais.addEventListener('click', function () {
    if (quantidade < 20) { quantidade++; atualizar(); }
  });

  btnEnvia.addEventListener('click', function () {
    if (!estado.cremes.length) return;

    var t = [];
    t.push('*PEDIDO — COPO FONDUE*');
    t.push('');
    t.push('*Copo Fondue 300ml*');
    t.push('Creme: ' + estado.cremes.join(', '));
    t.push('Frutas: ' + (estado.frutas.length ? estado.frutas.join(', ') : 'sem frutas'));
    t.push('Quantidade: ' + quantidade);
    t.push('');
    t.push('*Total: ' + moeda(PRECO_FONDUE * quantidade) + '*');

    window.open(
      'https://wa.me/' + WHATS + '?text=' + encodeURIComponent(t.join('\n')),
      '_blank',
      'noopener'
    );
  });

  atualizar();
})();
/* ===== FIM — ADIÇÃO COPO FONDUE ===== */

/* ===== INÍCIO — COPOS FONDUE EXTRAS (ilimitados) ===== */
(function () {
  'use strict';

  var PRECO = 26.00;
  var WHATS = '5517988134154';
  var MAX_COPOS = 20;

  var CREMES = ['Chocolate ao Leite','Chocolate Branco','Chocolate Meio Amargo',
                'Nutella','Ninho','Prestígio','Brigadeiro Gourmet','Doce de Leite',
                'Ovomaltine Cremoso','Maracujá Trufado'];
  var FRUTAS = ['Morango','Banana','Kiwi','Uva','Abacaxi','Manga','Pêssego','Cereja'];
  var MAX_FRUTAS = 3;

  var area = document.querySelector('.copoX-area');
  if (!area) return;

  var lista   = document.getElementById('copoX-lista');
  var btnAdd  = document.getElementById('copoX-add');
  var tagAdd  = document.getElementById('copoX-add-tag');
  var elTotal = document.getElementById('copoX-total');
  var btnEnv  = document.getElementById('copoX-enviar');
  if (!lista || !btnAdd || !tagAdd || !elTotal || !btnEnv) return;

  var copos = [];
  var seq = 0;

  function moeda(v){ return v.toLocaleString('pt-BR',{style:'currency',currency:'BRL'}); }

  function lerCopo1(grupo){
    var out = [], l = document.querySelector('.copo2-montagem [data-copo2-grupo="'+grupo+'"]');
    if (!l) return out;
    var it = l.querySelectorAll('.tag-item[aria-pressed="true"]');
    for (var i=0;i<it.length;i++) out.push(it[i].getAttribute('data-copo2-nome') || it[i].textContent.trim());
    return out;
  }
  function qtdCopo1(){
    var e = document.getElementById('copo2-qtd-valor');
    var n = e ? parseInt(e.textContent,10) : 1;
    return (isNaN(n)||n<1) ? 1 : n;
  }

  function grupo(copo, chave, titulo, itens, max){
    var box = document.createElement('div');
    box.className = 'copoX-grupo';

    var t = document.createElement('span');
    t.className = 'copoX-titulo';
    t.textContent = titulo;
    box.appendChild(t);

    var c = document.createElement('p');
    c.className = 'copoX-cont';
    c.setAttribute('role','status');
    c.setAttribute('aria-live','polite');
    box.appendChild(c);

    var wrap = document.createElement('div');
    wrap.className = 'copoX-tags';

    itens.forEach(function(nome){
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'copoX-tag';
      b.setAttribute('aria-pressed','false');
      b.textContent = nome;
      b.addEventListener('click', function(){
        var sel = copo.sel[chave];
        var pos = sel.indexOf(nome);
        if (pos > -1){
          sel.splice(pos,1);
          b.setAttribute('aria-pressed','false');
        } else {
          if (max === 1){
            var all = wrap.querySelectorAll('.copoX-tag');
            for (var k=0;k<all.length;k++) all[k].setAttribute('aria-pressed','false');
            sel.length = 0;
          } else if (sel.length >= max){
            box.classList.add('copoX-shake');
            setTimeout(function(){ box.classList.remove('copoX-shake'); },380);
            return;
          }
          sel.push(nome);
          b.setAttribute('aria-pressed','true');
        }
        render();
      });
      wrap.appendChild(b);
    });

    box.appendChild(wrap);
    copo.refs[chave] = { cont:c, wrap:wrap, max:max };
    return box;
  }

  function criarCopo(){
    if (copos.length >= MAX_COPOS) return;
    seq++;
    var copo = { id:seq, qtd:1, sel:{cremes:[],frutas:[]}, refs:{}, el:null };

    var card = document.createElement('div');
    card.className = 'copoX-card';

    var topo = document.createElement('div');
    topo.className = 'copoX-topo';
    var selo = document.createElement('span');
    selo.className = 'copoX-selo';
    var h = document.createElement('h3');
    h.textContent = 'Copo Fondue 300ml';
    var lixo = document.createElement('button');
    lixo.type = 'button';
    lixo.className = 'copoX-lixo';
    lixo.setAttribute('aria-label','Remover este copo');
    lixo.innerHTML = '&times;';
    lixo.addEventListener('click', function(){
      card.classList.add('copoX-saindo');
      setTimeout(function(){
        var i = copos.indexOf(copo);
        if (i > -1) copos.splice(i,1);
        if (card.parentNode) card.parentNode.removeChild(card);
        render();
      }, 250);
    });
    topo.appendChild(selo); topo.appendChild(h); topo.appendChild(lixo);
    card.appendChild(topo);

    card.appendChild(grupo(copo,'cremes','Creme do fondue',CREMES,1));
    card.appendChild(grupo(copo,'frutas','Frutas para mergulhar',FRUTAS,MAX_FRUTAS));

    var rod = document.createElement('div');
    rod.className = 'copoX-rodape';

    var lab = document.createElement('span');
    lab.className = 'campo-label';
    lab.textContent = 'Quantidade';

    var step = document.createElement('div');
    step.className = 'quantidade-stepper';
    var menos = document.createElement('button');
    menos.type='button'; menos.className='qtd-btn';
    menos.setAttribute('aria-label','Diminuir quantidade');
    menos.textContent = '−';
    var val = document.createElement('span');
    val.className = 'qtd-valor'; val.setAttribute('aria-live','polite'); val.textContent = '1';
    var mais = document.createElement('button');
    mais.type='button'; mais.className='qtd-btn';
    mais.setAttribute('aria-label','Aumentar quantidade');
    mais.textContent = '+';
    menos.addEventListener('click', function(){ if(copo.qtd>1){copo.qtd--; render();} });
    mais.addEventListener('click',  function(){ if(copo.qtd<20){copo.qtd++; render();} });
    step.appendChild(menos); step.appendChild(val); step.appendChild(mais);

    var sub = document.createElement('span');
    sub.className = 'copoX-sub';

    rod.appendChild(lab); rod.appendChild(step); rod.appendChild(sub);
    card.appendChild(rod);

    copo.el = card;
    copo.refs.selo = selo;
    copo.refs.val = val;
    copo.refs.sub = sub;

    copos.push(copo);
    lista.appendChild(card);
    render();
    card.scrollIntoView({ behavior:'smooth', block:'center' });
  }

  function render(){
    var total = PRECO * qtdCopo1();

    copos.forEach(function(copo, idx){
      copo.refs.selo.textContent = (idx + 2) + 'º Copo';
      copo.refs.val.textContent = String(copo.qtd);
      copo.refs.sub.textContent = copo.sel.cremes.length ? moeda(PRECO * copo.qtd) : '—';
      if (copo.sel.cremes.length) total += PRECO * copo.qtd;

      
      var r1 = copo.refs.cremes;
      r1.cont.textContent = copo.sel.cremes.length
        ? 'Creme: ' + copo.sel.cremes[0]
        : 'Escolha 1 creme';

      var r2 = copo.refs.frutas;
      r2.cont.textContent = copo.sel.frutas.length
        ? copo.sel.frutas.length + ' de ' + r2.max + ' frutas escolhidas'
        : 'Escolha até ' + r2.max + ' frutas';

      var cheio = copo.sel.frutas.length >= r2.max;
      var tags = r2.wrap.querySelectorAll('.copoX-tag');
      for (var i=0;i<tags.length;i++){
        if (cheio && tags[i].getAttribute('aria-pressed') !== 'true') tags[i].classList.add('copoX-off');
        else tags[i].classList.remove('copoX-off');
      }
    });

    var n = 1 + copos.length;
    tagAdd.textContent = n + (n === 1 ? ' copo' : ' copos');
    btnAdd.disabled = copos.length >= MAX_COPOS;
    elTotal.textContent = moeda(total);

    var ok = lerCopo1('cremes').length > 0;
    for (var j=0;j<copos.length;j++){
      if (copos[j].sel.cremes.length === 0) ok = false;
    }
    btnEnv.disabled = !ok;
  }

  btnAdd.addEventListener('click', criarCopo);

  document.addEventListener('click', function(ev){
    if (ev.target.closest('.copo2-montagem')) setTimeout(render, 0);
  });

  btnEnv.addEventListener('click', function(){
    var c1 = lerCopo1('cremes');
    if (!c1.length) return;

    var t = ['*PEDIDO — COPO FONDUE*',''];
    t.push('*1º Copo Fondue 300ml*');
    t.push('Creme: ' + c1.join(', '));
    var f1 = lerCopo1('frutas');
    t.push('Frutas: ' + (f1.length ? f1.join(', ') : 'sem frutas'));
    t.push('Quantidade: ' + qtdCopo1());

    var total = PRECO * qtdCopo1();

    copos.forEach(function(copo, idx){
      if (!copo.sel.cremes.length) return;
      t.push('');
      t.push('*' + (idx + 2) + 'º Copo Fondue 300ml*');
      t.push('Creme: ' + copo.sel.cremes.join(', '));
      t.push('Frutas: ' + (copo.sel.frutas.length ? copo.sel.frutas.join(', ') : 'sem frutas'));
      t.push('Quantidade: ' + copo.qtd);
      total += PRECO * copo.qtd;
    });

    t.push('');
    t.push('*Total: ' + moeda(total) + '*');

    window.open('https://wa.me/' + WHATS + '?text=' + encodeURIComponent(t.join('\n')),
                '_blank', 'noopener');
  });

  render();
})();
/* ===== FIM — COPOS FONDUE EXTRAS ===== */

/* ===== INÍCIO — COPOS DE AÇAÍ EXTRAS (ilimitados) ===== */
(function () {
  'use strict';

  var WHATS = '5517988134154';
  var MAX_COPOS = 20;
  var MAX_SORVETES = 2;

    /* preços de frutas e cremes (usados se o HTML não tiver data-preco) */
  var PRECOS = {
    'Morango':3.00, 'Banana':2.00, 'Kiwi':3.00, 'Uva':2.00,
    'Ninho':5.00, 'Nutella':4.00, 'Creme de Paçoca':4.00,
    'Prestígio':4.00, 'Trufa ao Leite':4.00, 'Chocowaffer Branco':4.00
  };
  var GRUPOS_PAGOS = { frutas:1, cremes:1 };


  var area = document.querySelector('.copoA-area');
  if (!area) return;

  var lista   = document.getElementById('copoA-lista');
  var btnAdd  = document.getElementById('copoA-add');
  var tagAdd  = document.getElementById('copoA-add-tag');
  var boxSub  = document.getElementById('copoA-resumo-extra');
  var elSub   = document.getElementById('copoA-subtotal');
  if (!lista || !btnAdd || !tagAdd || !boxSub || !elSub) return;

  function moeda(v){ return v.toLocaleString('pt-BR',{style:'currency',currency:'BRL'}); }
  function txt(el){ return el ? el.textContent.trim() : ''; }

  /* ---------- lê o cardápio do Copo 1, sem alterá-lo ---------- */
  function lerTamanhos(){
    var out = [];
    var cards = document.querySelectorAll('#grupo-tamanho .tamanho-card');
    for (var i=0;i<cards.length;i++){
      out.push({
        nome:   cards[i].getAttribute('data-tamanho') || '',
        preco:  parseFloat(cards[i].getAttribute('data-preco')) || 0,
        gratis: parseInt(cards[i].getAttribute('data-gratis'),10) || 0
      });
    }
    return out;
  }

    function lerOpcoes(grupo){
    var out = [], vistos = {};
    var l = document.querySelector('#monte-acai [data-grupo="'+grupo+'"]');
    if (!l) return out;
    var it = l.querySelectorAll('.tag-item');
    for (var i=0;i<it.length;i++){
      var nome = it[i].getAttribute('data-nome') || txt(it[i]);
      if (vistos[nome]) continue;
      vistos[nome] = 1;
      var p = parseFloat(it[i].getAttribute('data-preco'));
      if (isNaN(p)) p = PRECOS[nome] || 0;
      out.push({ nome:nome, preco: GRUPOS_PAGOS[grupo] ? p : 0 });
    }
    return out;
  }

  function lerAdicionais(){
    var out = [], vistos = {};
    var it = document.querySelectorAll('#monte-acai .adicional-item');
    for (var i=0;i<it.length;i++){
      var nome = it[i].getAttribute('data-nome') || txt(it[i]);
      var preco = parseFloat(it[i].getAttribute('data-preco')) || 0;
      var chave = nome + '|' + preco;
      if (!vistos[chave]){ vistos[chave] = 1; out.push({ nome:nome, preco:preco }); }
    }
    return out;
  }

  var TAMANHOS   = lerTamanhos();
  var SORVETES   = lerOpcoes('sorvetes');
  var ACOMPS     = lerOpcoes('acompanhamentos');
  var FRUTAS     = lerOpcoes('frutas');
  var CREMES     = lerOpcoes('cremes');
  var ADICIONAIS = lerAdicionais();

  if (!TAMANHOS.length) return;

  /* ---------- estado ---------- */
  var copos = [];
  function grupoTags(copo, chave, titulo, itens, limiteFn){
    var box = document.createElement('div');
    box.className = 'copoA-grupo';

    var t = document.createElement('span');
    t.className = 'copoA-titulo';
    t.textContent = titulo;
    box.appendChild(t);

    var c = document.createElement('p');
    c.className = 'copoA-cont';
    c.setAttribute('role','status');
    c.setAttribute('aria-live','polite');
    box.appendChild(c);

    var wrap = document.createElement('div');
    wrap.className = 'copoA-tags';

    itens.forEach(function(item){
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'copoA-tag';
      b.setAttribute('aria-pressed','false');
      b.appendChild(document.createTextNode(item.nome));
      if (item.preco > 0){
        var s = document.createElement('small');
        s.textContent = moeda(item.preco);
        b.appendChild(s);
      }
      b.addEventListener('click', function(){
        var sel = copo.sel[chave];
        var max = limiteFn();
        var idx = -1;
        for (var i=0;i<sel.length;i++){ if (sel[i].nome === item.nome){ idx = i; break; } }
        if (idx > -1){
          sel.splice(idx,1);
          b.setAttribute('aria-pressed','false');
        } else {
          if (sel.length >= max){
            box.classList.add('copoA-shake');
            setTimeout(function(){ box.classList.remove('copoA-shake'); },380);
            return;
          }
          sel.push(item);
          b.setAttribute('aria-pressed','true');
        }
        render();
      });
      wrap.appendChild(b);
    });

    box.appendChild(wrap);
    copo.refs[chave] = { box:box, cont:c, wrap:wrap, limiteFn:limiteFn };
    return box;
  }

  function grupoAdicionais(copo){
    var box = document.createElement('div');
    box.className = 'copoA-grupo';

    var t = document.createElement('span');
    t.className = 'copoA-titulo';
    t.textContent = 'Adicionais (valor à parte)';
    box.appendChild(t);

    var c = document.createElement('p');
    c.className = 'copoA-cont';
    c.textContent = 'Opcional · toque para incluir';
    box.appendChild(c);

    var wrap = document.createElement('div');
    wrap.className = 'copoA-tags';

    ADICIONAIS.forEach(function(item){
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'copoA-tag';
      b.setAttribute('aria-pressed','false');
      b.innerHTML = '';
      b.appendChild(document.createTextNode(item.nome));
      var s = document.createElement('small');
      s.textContent = '+ ' + moeda(item.preco);
      b.appendChild(s);
      b.addEventListener('click', function(){
        var sel = copo.sel.adicionais;
        var idx = -1;
        for (var i=0;i<sel.length;i++){
          if (sel[i].nome === item.nome && sel[i].preco === item.preco){ idx = i; break; }
        }
        if (idx > -1){
          sel.splice(idx,1);
          b.setAttribute('aria-pressed','false');
        } else {
          sel.push(item);
          b.setAttribute('aria-pressed','true');
        }
        render();
      });
      wrap.appendChild(b);
    });

    box.appendChild(wrap);
    copo.refs.adicionais = { box:box, cont:c, wrap:wrap };
    return box;
  }

  function criarCopo(){
    if (copos.length >= MAX_COPOS) return;

    var copo = {
      tam: null, qtd: 1,
      sel: { sorvetes:[], acompanhamentos:[], frutas:[], cremes:[], adicionais:[] },
      refs: {}, el: null
    };

    var card = document.createElement('div');
    card.className = 'copoA-card';

    /* topo */
    var topo = document.createElement('div');
    topo.className = 'copoA-topo';
    var selo = document.createElement('span');
    selo.className = 'copoA-selo';
    var h = document.createElement('h3');
    h.textContent = 'Copo de Açaí';
    var lixo = document.createElement('button');
    lixo.type = 'button';
    lixo.className = 'copoA-lixo';
    lixo.setAttribute('aria-label','Remover este copo');
    lixo.innerHTML = '&times;';
    lixo.addEventListener('click', function(){
      card.classList.add('copoA-saindo');
      setTimeout(function(){
        var i = copos.indexOf(copo);
        if (i > -1) copos.splice(i,1);
        if (card.parentNode) card.parentNode.removeChild(card);
        render();
      },250);
    });
    topo.appendChild(selo); topo.appendChild(h); topo.appendChild(lixo);
    card.appendChild(topo);

    /* tamanho */
    var gTam = document.createElement('div');
    gTam.className = 'copoA-grupo';
    var tTam = document.createElement('span');
    tTam.className = 'copoA-titulo';
    tTam.textContent = 'Tamanho do copo';
    gTam.appendChild(tTam);
    var cTam = document.createElement('p');
    cTam.className = 'copoA-cont';
    cTam.setAttribute('role','status');
    cTam.setAttribute('aria-live','polite');
    cTam.textContent = 'Escolha o tamanho para liberar as opções';
    gTam.appendChild(cTam);

    var wTam = document.createElement('div');
    wTam.className = 'copoA-tam';
    TAMANHOS.forEach(function(tam){
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'copoA-tam-btn';
      b.setAttribute('aria-pressed','false');
      var bb = document.createElement('b');
      bb.textContent = tam.nome + ' · ' + moeda(tam.preco);
      var sp = document.createElement('span');
      sp.textContent = tam.gratis + ' acompanhamentos grátis';
      b.appendChild(bb); b.appendChild(sp);
      b.addEventListener('click', function(){
        var todos = wTam.querySelectorAll('.copoA-tam-btn');
        for (var k=0;k<todos.length;k++) todos[k].setAttribute('aria-pressed','false');
        b.setAttribute('aria-pressed','true');
        copo.tam = tam;
        if (copo.sel.acompanhamentos.length > tam.gratis){
          copo.sel.acompanhamentos.length = tam.gratis;
          var tags = copo.refs.acompanhamentos.wrap.querySelectorAll('.copoA-tag');
          for (var j=0;j<tags.length;j++){
            var n = tags[j].textContent.trim();
            tags[j].setAttribute('aria-pressed',
              copo.sel.acompanhamentos.indexOf(n) > -1 ? 'true' : 'false');
          }
        }
        render();
      });
      wTam.appendChild(b);
    });
    gTam.appendChild(wTam);
    card.appendChild(gTam);
    copo.refs.tamanho = { cont:cTam };

    /* demais grupos */
    card.appendChild(grupoTags(copo,'sorvetes','Sabores de sorvete',SORVETES,
      function(){ return MAX_SORVETES; }));

    card.appendChild(grupoTags(copo,'acompanhamentos','Acompanhamentos',ACOMPS,
      function(){ return copo.tam ? copo.tam.gratis : 0; }));

    card.appendChild(grupoTags(copo,'frutas','Frutas',FRUTAS,
      function(){ return 4; }));

     card.appendChild(grupoTags(copo,'cremes','Cremes',CREMES,
      function(){ return 2; }));

    card.appendChild(grupoAdicionais(copo));

    /* rodapé: quantidade + subtotal */
    var rod = document.createElement('div');
    rod.className = 'copoA-rodape';

    var lab = document.createElement('span');
    lab.className = 'campo-label';
    lab.textContent = 'Quantidade';

    var step = document.createElement('div');
    step.className = 'quantidade-stepper';
    var menos = document.createElement('button');
    menos.type = 'button'; menos.className = 'qtd-btn';
    menos.setAttribute('aria-label','Diminuir quantidade');
    menos.textContent = '−';
    var val = document.createElement('span');
    val.className = 'qtd-valor';
    val.setAttribute('aria-live','polite');
    val.textContent = '1';
    var mais = document.createElement('button');
    mais.type = 'button'; mais.className = 'qtd-btn';
    mais.setAttribute('aria-label','Aumentar quantidade');
    mais.textContent = '+';
    menos.addEventListener('click', function(){ if (copo.qtd > 1){ copo.qtd--; render(); } });
    mais.addEventListener('click',  function(){ if (copo.qtd < 20){ copo.qtd++; render(); } });
    step.appendChild(menos); step.appendChild(val); step.appendChild(mais);

    var sub = document.createElement('span');
    sub.className = 'copoA-sub';
    sub.textContent = '—';

    rod.appendChild(lab); rod.appendChild(step); rod.appendChild(sub);
    card.appendChild(rod);

    copo.el = card;
    copo.refs.selo = selo;
    copo.refs.val = val;
    copo.refs.sub = sub;

    copos.push(copo);
    lista.appendChild(card);
    render();
    card.scrollIntoView({ behavior:'smooth', block:'center' });
  }

  /* ---------- cálculo de um copo ---------- */
    
  function totalCopo(copo){
    if (!copo.tam) return 0;
    var t = copo.tam.preco;
    var g = ['frutas','cremes','adicionais'];
    for (var k=0;k<g.length;k++){
      var sel = copo.sel[g[k]];
      for (var i=0;i<sel.length;i++) t += (sel[i].preco || 0);
    }
    return t * copo.qtd;
  }

  /* ---------- atualização geral ---------- */
  function render(){
    var subtotal = 0;

    copos.forEach(function(copo, idx){
      copo.refs.selo.textContent = (idx + 2) + 'º Copo';
      copo.refs.val.textContent = String(copo.qtd);

      var tot = totalCopo(copo);
      subtotal += tot;
      copo.refs.sub.textContent = copo.tam ? moeda(tot) : '—';

      copo.refs.tamanho.cont.textContent = copo.tam
        ? 'Tamanho: ' + copo.tam.nome + ' · ' + copo.tam.gratis + ' acompanhamentos grátis'
        : 'Escolha o tamanho para liberar as opções';
      ['sorvetes','acompanhamentos','frutas','cremes'].forEach(function(chave){
        var r = copo.refs[chave];
        if (!r) return;

        var max = r.limiteFn();
        var sel = copo.sel[chave];
        var travado = (chave !== 'sorvetes') && !copo.tam;

        var soma = 0;
        for (var s=0;s<sel.length;s++) soma += (sel[s].preco || 0);

        if (travado){
          r.box.classList.add('copoA-bloqueado');
          r.cont.textContent = 'Escolha o tamanho do copo primeiro';
        } else {
          r.box.classList.remove('copoA-bloqueado');
          if (!sel.length){
            r.cont.textContent = 'Escolha até ' + max;
          } else if (soma > 0){
            r.cont.innerHTML = sel.length + ' selecionado(s) = <b>' + moeda(soma) + '</b>';
          } else {
            r.cont.textContent = sel.length + ' de ' + max + ' selecionado(s)';
          }
        }

        var cheio = sel.length >= max;
        var tags = r.wrap.querySelectorAll('.copoA-tag');
        for (var i=0;i<tags.length;i++){
          if (cheio && tags[i].getAttribute('aria-pressed') !== 'true'){
            tags[i].classList.add('copoA-off');
          } else {
            tags[i].classList.remove('copoA-off');
          }
        }
      });


      if (copo.refs.adicionais){
        if (copo.tam) copo.refs.adicionais.box.classList.remove('copoA-bloqueado');
        else copo.refs.adicionais.box.classList.add('copoA-bloqueado');
      }
    });

    var n = 1 + copos.length;
    tagAdd.textContent = n + (n === 1 ? ' copo' : ' copos');
    btnAdd.disabled = copos.length >= MAX_COPOS;

    boxSub.hidden = copos.length === 0;
    elSub.textContent = moeda(subtotal);
  }

  /* ---------- monta o texto dos copos extras ---------- */
   function textoExtras(){
    var linhas = [];

    function nomes(arr){
      var o = [];
      for (var i=0;i<arr.length;i++){
        o.push(arr[i].preco > 0 ? arr[i].nome + ' (' + moeda(arr[i].preco) + ')' : arr[i].nome);
      }
      return o.join(', ');
    }

    copos.forEach(function(copo, idx){
      if (!copo.tam) return;
      linhas.push('');
      linhas.push('*' + (idx + 2) + 'º Copo — Açaí ' + copo.tam.nome + '*');

      if (copo.sel.sorvetes.length)        linhas.push('Sorvetes: ' + nomes(copo.sel.sorvetes));
      if (copo.sel.acompanhamentos.length) linhas.push('Acompanhamentos: ' + nomes(copo.sel.acompanhamentos));
      if (copo.sel.frutas.length)          linhas.push('Frutas: ' + nomes(copo.sel.frutas));
      if (copo.sel.cremes.length)          linhas.push('Cremes: ' + nomes(copo.sel.cremes));

      if (copo.sel.adicionais.length){
        var ad = [];
        for (var i=0;i<copo.sel.adicionais.length;i++){
          ad.push(copo.sel.adicionais[i].nome + ' (' + moeda(copo.sel.adicionais[i].preco) + ')');
        }
        linhas.push('Adicionais: ' + ad.join(', '));
      }

      linhas.push('Quantidade: ' + copo.qtd);
      linhas.push('Subtotal: ' + moeda(totalCopo(copo)));
    });

    return linhas;
  }


  /* ---------- anexa os extras à mensagem do botão original ---------- */
  var btnOriginal = document.getElementById('btn-enviar-pedido');
  if (btnOriginal){
    btnOriginal.addEventListener('click', function(){
      if (!copos.length) return;
      var extras = textoExtras();
      if (!extras.length) return;

      var total = 0;
      for (var i=0;i<copos.length;i++) total += totalCopo(copos[i]);

      var msg = ['*COPOS ADICIONAIS*'].concat(extras);
      msg.push('');
      msg.push('*Subtotal dos copos extras: ' + moeda(total) + '*');

      setTimeout(function(){
        window.open('https://wa.me/' + WHATS + '?text=' + encodeURIComponent(msg.join('\n')),
                    '_blank', 'noopener');
      }, 700);
    });
  }

  btnAdd.addEventListener('click', criarCopo);

  render();
})();
/* ===== FIM — COPOS DE AÇAÍ EXTRAS ===== */