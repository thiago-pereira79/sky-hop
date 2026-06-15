# 🐤 Sky Hop

![License](https://img.shields.io/badge/License-MIT-green.svg)
![Status](https://img.shields.io/badge/Status-Concluído-brightgreen)
![Stack](https://img.shields.io/badge/Feito%20com-React%20%2B%20TypeScript%20%2B%20Vite-blue)

---

## 🌤️ Sobre o projeto

**Sky Hop** é um jogo arcade inspirado em mecânicas clássicas de voo com um toque, onde o jogador precisa controlar um pequeno personagem pelos céus, desviando de obstáculos, coletando moedas e tentando sobreviver até o fim da fase ou alcançar a maior pontuação possível no modo infinito.

O projeto foi desenvolvido com foco em **lógica de jogo, experiência do usuário, responsividade, áudio interativo e interface visual moderna**.

A proposta foi criar uma versão própria, com identidade visual independente, sistema de fases, modo infinito, efeitos sonoros, orientação para dispositivos móveis e uma experiência pensada para diferentes telas.

🔗 **Jogo disponível aqui:**  
https://thiago-pereira79.github.io/sky-hop/

---

## 🚀 O que foi aprimorado em relação à mecânica clássica

| Recurso | Descrição |
|---------|-----------|
| 🐤 Mecânica de voo | Controle do personagem com impulso, gravidade e colisão |
| 🧱 Obstáculos | Barreiras aparecem durante o percurso e exigem precisão |
| 🪙 Moedas | Moedas coletáveis durante as fases |
| 🌟 Sistema de estrelas | Avaliação de desempenho conforme moedas coletadas |
| 🗺️ Sistema de fases | Fases organizadas por mundos temáticos |
| 🔁 Modo infinito | Modo livre para tentar alcançar a maior pontuação possível |
| 🔊 Efeitos sonoros | Sons para impulso, moedas, Game Over e vitória |
| 📱 Responsividade | Funciona em desktop, notebook, celular, tablet e iPad no modo vertical |
| 🔄 Orientação mobile | Em celulares/tablets na horizontal, o jogo orienta o usuário a voltar para vertical |
| 🎯 UX/UI refinada | Interface limpa, botões claros, feedback visual e estados bem definidos |
| 🧩 Estados de jogo | Menu, seleção de fases, partida, pausa, Game Over e fase concluída |

---

## 🎮 Como jogar

### Desktop / Notebook

Use os controles principais:

- `Espaço` para fazer o personagem subir
- Clique na área do jogo para impulsionar o personagem
- `P` para pausar a partida, se disponível
- `Enter` para confirmar ou reiniciar em algumas telas, se disponível

O objetivo é desviar dos obstáculos, coletar moedas e sobreviver até concluir a fase ou alcançar a maior pontuação no modo infinito.

### Celular, Tablet e iPad

O jogo foi pensado para funcionar em **modo vertical**.

Nos dispositivos móveis, o controle principal é:

- toque na tela para fazer o personagem voar.

Ao virar o dispositivo para o modo horizontal, o jogo exibe uma orientação amigável para voltar ao modo vertical, garantindo uma experiência mais confortável e consistente.

---

## 🕹️ Modos de jogo

### ⭐ Fases

Permite jogar fases organizadas por mundos temáticos, com progressão visual e variação de dificuldade.

As fases contam com:

- obstáculos;
- moedas;
- objetivos de sobrevivência;
- avaliação por estrelas;
- cenários com diferentes atmosferas;
- dificuldade progressiva.

### 🔁 Infinito

Modo livre em que o jogador tenta sobreviver o máximo possível e alcançar a maior pontuação da sessão.

Esse modo mantém a experiência arcade mais clássica, focada em reflexo, ritmo e repetição rápida.

---

## 🌍 Estrutura de fases

O jogo possui fases organizadas em mundos temáticos, com variações de cenário, dificuldade e ritmo.

| Mundo | Tema | Característica |
|-------|------|----------------|
| Mundo 1 | Céu Claro | Fases iniciais, ritmo mais leve e adaptação |
| Mundo 2 | Pôr do Sol | Velocidade maior e obstáculos mais próximos |
| Mundo 3 | Noite Estrelada | Maior precisão e desafio |
| Mundo 4 | Tempestade | Dificuldade mais intensa e ritmo acelerado |

Todas as fases ficam disponíveis para seleção, permitindo que o jogador explore livremente os diferentes desafios.

---

## 🛠️ Conceitos explorados

- Manipulação de estados com **React**
- Componentização com **TypeScript**
- Renderização e lógica visual com **Canvas**
- Game loop com `requestAnimationFrame`
- Física simples com gravidade e impulso
- Detecção de colisão
- Sistema de fases
- Sistema de moedas
- Sistema de estrelas
- Controle de dificuldade progressiva
- Feedback sonoro com **Web Audio API**
- Responsividade mobile-first
- Controle por teclado, clique e toque
- Bloqueio de experiência em orientação horizontal mobile
- Persistência local com **localStorage**
- UX aplicada a jogos casuais
- Deploy com **GitHub Pages**

---

## 🧰 Ferramentas utilizadas

| Etapa | Ferramenta | Finalidade |
|-------|------------|------------|
| Desenvolvimento | React + TypeScript | Estrutura principal do jogo |
| Build | Vite | Ambiente rápido de desenvolvimento |
| Estilo | Tailwind CSS | Layout, responsividade e identidade visual |
| Renderização | Canvas API | Desenho e lógica visual do jogo |
| Áudio | Web Audio API | Efeitos sonoros gerados por código |
| Versionamento | Git & GitHub | Controle de versão e publicação |
| Deploy | GitHub Pages | Hospedagem do projeto |

---

## 📁 Estrutura do projeto

    sky-hop/
    │
    ├── assets/
    │   └── .aistudio/
    │
    ├── src/
    │   ├── components/
    │   │   └── SkyHopGame.tsx
    │   │
    │   ├── utils/
    │   │   └── audio.ts
    │   │
    │   ├── App.tsx
    │   ├── index.css
    │   ├── main.tsx
    │   └── types.ts
    │
    ├── .env.example
    ├── .gitignore
    ├── index.html
    ├── metadata.json
    ├── package-lock.json
    ├── package.json
    ├── README.md
    ├── tsconfig.json
    └── vite.config.ts

---

## 🎨 Identidade visual

O jogo segue uma estética **arcade moderna**, com:

- fundo inspirado em céu;
- interface escura;
- botões com destaque visual;
- elementos minimalistas;
- contraste forte;
- feedback visual claro;
- composição responsiva;
- foco em clareza, controle e fluidez.

A interface foi pensada para reduzir carga cognitiva e permitir que o jogador entenda rapidamente como iniciar, escolher fases e jogar.

---

## 🔊 Sistema de áudio

Os sons foram criados com **Web Audio API**, sem arquivos externos.

O jogo possui efeitos para:

- impulso do personagem;
- coleta de moedas;
- Game Over;
- fase concluída;
- vitória;
- interação com botões, se disponível.

Também existe controle para ativar ou desativar o som, respeitando a preferência do jogador.

Não há música de fundo contínua, evitando cansaço auditivo e mantendo os feedbacks sonoros mais claros durante a jogabilidade.

---

## 📱 Responsividade

O jogo foi validado para:

- desktop;
- notebook;
- telas grandes;
- celulares no modo vertical;
- tablets no modo vertical;
- iPad no modo vertical.

Em dispositivos móveis no modo horizontal, a experiência é bloqueada com uma mensagem de orientação, pois o jogo foi otimizado para uma experiência mais confortável no modo vertical.

Mensagem exibida no modo horizontal:

> **Gire seu dispositivo**  
> Este jogo foi pensado para uma experiência mais fluida no modo vertical.  
> Volte para a posição vertical para continuar jogando.

---

## 🧪 Validação final

O projeto foi revisado considerando:

- build sem erros;
- TypeScript sem erros;
- ausência de erros no console;
- funcionamento em desktop;
- funcionamento em mobile vertical;
- funcionamento em tablet/iPad vertical;
- bloqueio elegante no modo horizontal mobile/tablet/iPad;
- controles por teclado, mouse e toque;
- sons funcionando corretamente;
- fases desbloqueadas;
- modo infinito funcional;
- Game Over funcionando;
- vitória/fase concluída funcionando;
- layout sem cortes nos principais dispositivos.

---

## 🧩 Próximas melhorias possíveis

- Novas skins para o personagem
- Temas visuais desbloqueáveis
- Ranking local
- Ranking online
- Novos tipos de obstáculos
- Animações extras entre fases
- Melhorias visuais usando sprites personalizados
- Tela de conquistas
- Sistema de loja com moedas
- Novos efeitos de partículas

---

## 📌 Aprendizados

Este projeto ajudou a praticar:

- criação de jogos com React;
- controle de estados complexos;
- lógica de colisão;
- física simples em jogos;
- organização de componentes;
- experiência de usuário aplicada a jogos;
- responsividade real para diferentes dispositivos;
- refinamento visual e testes de interface;
- uso de prompts para evolução iterativa com IA.

---

## 📄 Licença

Este projeto está sob a licença **MIT** - sinta-se livre para estudar, adaptar ou evoluir.

---

💻 Desenvolvido por **Thiago Pereira**