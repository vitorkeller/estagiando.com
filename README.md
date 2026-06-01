# Estagiando.com - Sistema Web de Gestão de Estágios

O Estagiando.com é um Sistema Web de Gestão de Estágios desenvolvido com foco rigoroso em segurança, segregação de privilégios e rastreabilidade de dados. A plataforma foi projetada para gerenciar o fluxo completo de informações e o ciclo de avaliação de estágios, mitigando riscos de acessos não autorizados e garantindo a integridade dos documentos acadêmicos e corporativos.

<p align="center">
  <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/nextjs/nextjs-original.svg" alt="Next.js" width="60" height="60" />
  <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/express/express-original.svg" alt="Express" width="60" height="60" style="background-color: white;" />
  <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/postgresql/postgresql-original.svg" alt="PostgreSQL" width="60" height="60" />
</p>

---

## Tabela de Conteúdos
1. [Visão Geral do Projeto](#visão-geral-do-projeto)
2. [Perfis de Acesso e Segregação de Privilégios](#perfis-de-acesso-e-segregação-de-privilégios)
3. [Funcionalidades Principais](#funcionalidades-principais)
4. [Tecnologias Utilizadas](#tecnologias-utilizadas)
5. [Arquitetura e Segurança](#arquitetura-e-segurança)
6. [Instalação e Configuração](#instalação-e-configuração)

---

## Visão Geral do Projeto

O objetivo principal do Estagiando.com é fornecer um ambiente confiável para a submissão, acompanhamento, validação e auditoria de estágios obrigatórios e não obrigatórios. O sistema substitui fluxos físicos ou descentralizados por um fluxo digital centralizado, pautado em três pilares da segurança da informação:
* **Confidencialidade:** Garantia de que relatórios e dados sensíveis de alunos e empresas sejam visíveis apenas por partes autorizadas.
* **Integridade:** Mecanismos que impedem a alteração de avaliações e relatórios após a submissão ou validação formal.
* **Rastreabilidade:** Registro detalhado de logs e ações críticas para fins de auditoria e conformidade institucional.

---

## Perfis de Acesso e Segregação de Privilégios

O sistema opera sob o princípio do menor privilégio (Principle of Least Privilege), dividindo as permissões em três escopos estritos de atuação:

### Aluno (Usuário Comum)
* Escopo: Submissão e consulta.
* Permissões: Preenchimento de dados do estágio, upload seguro de relatórios de atividades, visualização do status do processo e consulta aos pareceres emitidos pelo orientador e coordenação. Não possui permissão para visualizar dados de outros alunos ou alterar registros validados.

### Orientador (Atendente)
* Escopo: Leitura, validação e acompanhamento contínuo.
* Permissões: Acesso aos relatórios dos alunos sob sua supervisão direta, inserção de feedbacks técnicos, validação de horas cumpridas e emissão de pareceres intermediários. Não possui privilégios de alteração de configurações do sistema ou aprovação final do encerramento do vínculo.

### Coordenação (Coordenador)
* Escopo: Auditoria, gestão macro e aprovação final.
* Permissões: Acesso irrestrito a todos os processos de estágio da instituição, homologação de convênios, emissão de parecer final de aprovação ou reprovação, geração de relatórios gerenciais consolidados e acesso ao painel de auditoria do sistema.

---

## Funcionalidades Principais

* **Autenticação e Controle de Acesso:** Mecanismo de login seguro com controle de acesso baseado em funções (RBAC - Role-Based Access Control). Gerenciamento de sessões e proteção contra ataques comuns de autenticação.
* **Gestão de Usuários:** Cadastro, edição e controle de status (ativo/inativo) de alunos, orientadores e coordenadores, garantindo o vínculo correto entre as entidades.
* **Gestão de Estágios:** Registro de novos contratos de estágio, termos aditivos, vigências e definições de carga horária.
* **Submissão de Relatórios:** Upload seguro de relatórios parciais e finais em formatos homologados, com verificação de integridade do arquivo.
* **Avaliação pelo Orientador:** Módulo para que o corpo docente possa revisar as atividades entregues, atribuir notas/conceitos e deferir ou indeferir relatórios.
* **Aprovação Final pela Coordenação:** Fluxo de encerramento do estágio, onde a coordenação valida o cumprimento de todos os requisitos regulatórios para fins de colação de grau ou validação de créditos.
* **Auditoria e Rastreabilidade:** Trilha de auditoria automatizada gravando quem acessou, modificou ou aprovou determinado registro, contendo carimbo de data/hora (timestamp) imutável.
* **Relatórios Gerenciais:** Painéis e extração de dados estatísticos sobre o panorama dos estágios vigentes, evasão, empresas parceiras e conformidade de prazos.

---

## Tecnologias Utilizadas

O ecossistema técnico foi selecionado para garantir escalabilidade, robustez de banco de dados e uma separação clara entre a camada de apresentação e as regras de negócio.

### Frontend
<p align="left">
  <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/nextjs/nextjs-original.svg" alt="Next.js" width="60" height="60" />
</p>

* **Next.js:** Framework React utilizado para a construção de uma interface de usuário responsiva, segura e com renderização otimizada no lado do servidor (SSR) para proteção de rotas privadas.

### Backend
<p align="left">
  <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/express/express-original.svg" alt="Express" width="60" height="60" style="background-color: white;" />
</p>

* **Express:** Framework para Node.js focado em minimalismo e performance, responsável pela construção da API RESTful, gerenciamento de middlewares de segurança (CORS, Helmet) e validação de tokens JWT.

### Banco de Dados
<p align="left">
  <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/postgresql/postgresql-original.svg" alt="PostgreSQL" width="60" height="60" />
</p>

* **PostgreSQL:** Sistema de gerenciamento de banco de dados relacional (SGBD) robusto, encarregado de assegurar a consistência dos dados (propriedades ACID), chaves estrangeiras e integridade referencial rigorosa para as tabelas de auditoria e usuários.

---

## Arquitetura e Segurança

1. **Separação de Camadas (Decoupled Architecture):** O frontend em Next.js comunica-se de forma assíncrona com a API Express exclusivamente via HTTPS, impedindo exposição direta do banco de dados ao cliente.
2. **Proteção de Rotas:** Filtros e middlewares validam o nível de acesso em cada requisição à API. Um token JWT correspondente ao perfil de "Aluno" é terminantemente rejeitado ao tentar acessar endpoints exclusivos da "Coordenação".
3. **Sanitização de Dados:** Proteção contra SQL Injection nativa através do uso de ORM/Query Builders no PostgreSQL, além de validação estrita de schemas de entrada de dados no backend para mitigar XSS (Cross-Site Scripting).

---

## Instalação e Configuração

### Pré-requisitos
* Node.js (versão 18 ou superior)
* PostgreSQL instalado e em execução

### Passo a Passo

1. **Clonar o repositório:**
   ```bash
   git clone [https://github.com/vitorkeller/controle_estagios.git](https://github.com/vitorkeller/controle_estagios.git)
   cd controle_estagios
2. ### Configuração do Banco de Dados
Crie uma instância de banco de dados no PostgreSQL e execute os scripts de migração estrutural fornecidos no diretório do banco para criar as tabelas de usuários, perfis, estágios e logs de auditoria.

3. ### Configuração das Variáveis de Ambiente
Configure os arquivos `.env` tanto no diretório do servidor quanto do cliente informando as credenciais de acesso ao banco de dados, chaves secretas para geração do JWT e portas de escuta das aplicações.

4. ### Instalação das dependências e execução
No diretório do backend/API:
### Instalação das dependências e execução
No diretório do backend/API:
```bash
npm install
npm run dev

No diretório do frontend/Next.js:
```bash
npm install
npm run dev
