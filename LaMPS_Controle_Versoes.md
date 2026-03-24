# LaMPS appPAJEclub - Controle de Versões
*Registro oficial de versões do aplicativo mobile e arquitetura. Documento fundamental de transição e backup entre as sessões automáticas da IA.*

## Histórico de Lançamentos (Release Notes)

### 🟢 Versão 1 (Baseline - Em Desenvolvimento)
**Data/Hora:** 07 de Março de 2026 - 23:05 BRT
**Status:** Ativa (Trabalho de hoje)
**Foco da Versão:** 
- Estabelecimento do *Hot Reload* diretamente no Celular via cabo USB (`run_usb.bat`).
- Implantação do painel de Métricas / Tela Isolada do Velocímetro (Gauge Screen).
- Início da auditoria da interface.

---
*Nota de Governança da IA: Ao final dos ajustes de hoje, encerraremos os trabalhos, marcaremos esta versão como [CONCLUÍDA/FECHADA] e usaremos este documento para garantir que o código na retomada assuma o mesmo marco exato da Versão 1, começando a Versão 2.*

### [23:14 - Integração WebView Concluída]
- **Ação:** Restauração da estratégia de WebView para consumo direto do Backend Django (/patient/gauge/).
- **Arquivos Afetados:** HDsysScreen.js (criado), AppNavigator.js (atualizado), DashboardScreen.js (botão premium).
- **Status:** Testável via Hot Reload no dispositivo USB. O App agora atua como uma casca nativa que embeda com sucesso o relatório analítico em tempo real.


### [23:37 - Fusão Walled Garden e Inteligência Django]
- **Ação:** Restauração do layout nativo Premium (Cabeçalho de perfil, avatares, fontes, Ouro Fosco) envolvendo o motor analítico de WebView.
- **Arquivos Afetados:** DashboardScreen.js.
- **Status:** Hybrid Modelo estabelecido com perfeição. Evitamos o 'retrabalho' gráfico respeitando os painéis de inteligência antigos (Histograma Python).

### [00:00 - Meta de Lançamento e Compliance V1.0.0]
- **Ação:** Refatoração de toda a experiência nativa para o Padrão "Paciente Cêntrico" e bloqueio judicial/LGPD e finalização dos metadados de loja.
- **Próximo Passo:** Compilação final via Terminal EAS (Android Play Store e iOS App Store).

### [08 de Março de 2026 - 03:00 BRT - Resgate Clínico e Governança]
- **Governança:** Transição oficial para o "Protocolo de Qualidade de Nível Médico (Obsidian Vault)". Criação da pasta raiz `PAJE_Governance` no cofre do CEO.
- **Ação Executada:** Resgate do arquivo puro Original de métricas (`GaugeChart.js`) da raiz descontinuada do PAJEapp para blindar a matemática de **Pressão Arterial Média (PAM)**. Desligamento do carregamento web via HDSys para o Velocímetro.
- **Arquivos Afetados (na Master):** `src/components/hdsys/GaugeChart.js` (Restaurado), `src/screens/GaugeScreen.js` (Nativo ativado), `src/screens/DashboardScreen.js` (Botão roteado), `src/navigation/AppNavigator.js` (Rota corrigida).
- **Status:** [CONCLUÍDA/FECHADA] - O App rende as marcações precisas de 'Hipo Grave' a 'Hiper 3' perfeitamente no novo padrão LaMPS (Ouro Fosco/Dark). Código-fonte salvo em `/Source_Control_Manual` no Obsidian para evitar "amnésia" na próxima IA atuante.

### [10 de Março de 2026 - Extrato Nativo appPAJEclub-V1]
- **Governança:** Redesenho estratégico focado nas lojas de aplicativos (Play Store/App Store). Adoção da experiência "Walled Garden" 100% Nativa e Assíncrona, abolindo o uso híbrido de WebView na Dashboard.
- **Ação Executada:** Extração e isolamento lógico das verticais de `Pacientes` e `Profissionais` do HDsys-V5, conectando-as ativamente através de um cliente API (Axios).
- **Segurança (Auditada):** Supabase foi integralmente removido das funções core de `AuthContext.js`. Autenticação agora se comunica com os endpoints auditados (Fail-Closed) de geração de Token JWT na aplicação Django Locaweb.
- **Arquivos Afetados:** `DashboardScreen.js` (WebView removido, FlatList nativa implementada), `LoginScreen.js` (refatorado para novo Auth service), `AddMeasurementScreen.js` (conectado à Endpoint `/api/submit/`), `src/services/api.js` e `auth.js` criados.
- **Status:** [BASELINE CRIADA] - App testado com sucesso pelo device físico USB. Interfaces mantiveram-se visualmente perfeitas e renderizando "Erros de Conexão Offline", validando a prontidão da casca para ser atrelada ao backend de produção.
