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
