# 📄 Documentação do Sistema - Dashboard de Performance Bitrix24

## 1. Visão Geral do Projeto

Este projeto é uma aplicação web de dashboard projetada para visualizar e exportar métricas de performance de contatos do Bitrix24. A aplicação consiste em duas páginas principais:

-   **Dashboard (`/`)**: Exibe os totais de contatos "Enviados" e "Liberados" para períodos de datas específicos, além de detalhar a performance individual de cinco usuários responsáveis.
-   **Página de Administração (`/admin`)**: Permite ao usuário configurar os filtros de data para "Envio" e "Liberação" que são aplicados globalmente à aplicação.

A principal complexidade deste projeto reside nas limitações da API REST do Bitrix24, que exigiram uma solução de arquitetura específica para garantir a precisão dos dados.

## 2. Stack de Tecnologias

-   **Framework**: React (com Vite e TypeScript)
-   **Estilização**: Tailwind CSS com a biblioteca de componentes Shadcn/ui.
-   **Gerenciamento de Estado**: Zustand
-   **Requisições HTTP**: Axios
-   **Hospedagem**: Vercel
-   **API Backend**: Vercel Serverless Function (como proxy)

## 3. Arquitetura e Lógica do Núcleo

A arquitetura foi desenhada para contornar uma limitação crítica da API do Bitrix24: a incapacidade de filtrar contatos de forma confiável por campos de data customizados (`UF_CRM_*`).

### 3.1. A Solução: Filtragem Manual no Cliente (Client-Side)

Após múltiplas tentativas de fazer a filtragem no servidor (via API), foi concluído que a API do Bitrix24 ou ignorava os filtros ou retornava resultados incorretos (0).

**A solução definitiva e 100% funcional é:**

1.  **Buscar Todos os Contatos**: A aplicação primeiro busca **todos os contatos** do Bitrix24, sem aplicar nenhum filtro de data na chamada inicial.
2.  **Paginação e Rate Limiting**: Para buscar milhares de contatos sem sobrecarregar a API, a função `fetchAllContactsWithPagination` em `src/services/bitrixApi.ts` foi criada. Ela busca contatos em blocos de 50 e implementa um `waitForRateLimit` para garantir que não excedamos o limite de 2 requisições por segundo da API, evitando erros `429 (Too Many Requests)`.
3.  **Filtragem Manual**: Com a lista completa de contatos em memória, a aplicação itera sobre cada um deles e aplica os filtros de data de "Envio" e "Liberação" diretamente no código JavaScript.
4.  **Cálculo das Métricas**: Apenas após a filtragem manual é que as métricas (totais e por responsável) são calculadas e exibidas no dashboard.

**Consequência**: Esta abordagem garante a **precisão total dos dados**, mas pode resultar em um tempo de carregamento inicial mais longo, dependendo do número total de contatos no Bitrix24.

### 3.2. Prevenção de Buscas Concorrentes (Fetch Lock)

Para evitar que múltiplas buscas de dados aconteçam ao mesmo tempo (ex: o usuário aplica um filtro enquanto a atualização automática de 30 segundos é disparada), foi implementado um "fetch lock" (`isFetchingMetrics`) no `bitrixApi.ts`. Isso garante que apenas uma operação de busca e filtragem ocorra por vez, prevenindo erros e inconsistências.

### 3.3. Proxy de API na Vercel

Para proteger o webhook da API REST do Bitrix24, foi criado um proxy simples usando uma Vercel Serverless Function em `api/bitrix-proxy.js`. O frontend nunca se comunica diretamente com o Bitrix24; ele envia as requisições para `/api/bitrix-proxy`, que por sua vez repassa a chamada para o webhook real, que está armazenado de forma segura como uma variável de ambiente na Vercel (`BITRIX_WEBHOOK_URL`).

## 4. Bugs Críticos Corrigidos (O Que Não Fazer)

Durante o desenvolvimento, alguns bugs críticos foram encontrados e corrigidos. Eles são essenciais para o funcionamento do sistema:

### 4.1. Bug de Fuso Horário (Timezone) na Seleção de Datas

-   **Problema**: O seletor de datas nativo do HTML (`<input type="date">`) retorna a data como uma string no formato `YYYY-MM-DD`. Quando o JavaScript converte isso com `new Date('2025-09-10')`, ele interpreta como "meia-noite no fuso horário UTC". Para usuários em fusos horários negativos (como o do Brasil, GMT-3), a data era incorretamente convertida para o dia anterior (ex: `09/09/2025 às 21:00`).
-   **Solução**: Em `src/pages/Admin.tsx`, a conversão da data foi ajustada para `new Date(e.target.value.replace(/-/g, '/'))`. O formato com barras (`YYYY/MM/DD`) força o JavaScript a interpretar a data no fuso horário local do usuário, garantindo que o dia selecionado seja o dia correto.

### 4.2. Bug de Conversão de Datas da API do Bitrix

-   **Problema**: O Bitrix retorna as datas como strings com fuso horário (ex: `2025-09-10T03:00:00+03:00`). Ao converter isso para um objeto `Date` com `new Date()`, o JavaScript novamente ajustava para o fuso horário local do usuário, resultando em uma data incorreta e falha na comparação com o filtro.
-   **Solução**: Em `src/services/bitrixApi.ts`, antes de converter a data do Bitrix, extraímos apenas a parte da data (`YYYY-MM-DD`) da string com `.split('T')[0]`. Isso elimina a informação de tempo e fuso horário, garantindo uma comparação consistente e precisa com as datas do filtro.

## 5. Como Executar o Projeto Localmente

1.  **Clone o repositório.**
2.  **Instale as dependências**:
    ```bash
    npm install
    ```
3.  **Crie o arquivo de ambiente**:
    -   Na raiz do projeto, crie um arquivo chamado `.env.local`.
    -   Dentro dele, adicione sua variável de ambiente do webhook:
        ```
        VITE_BITRIX_WEBHOOK_URL=https://seu-dominio.bitrix24.com.br/rest/seu-id/seu-codigo-secreto/
        ```
4.  **Execute o servidor de desenvolvimento**:
    ```bash
    npm run dev
    ```
5.  Acesse `http://localhost:5173` (ou a porta indicada no seu terminal).
