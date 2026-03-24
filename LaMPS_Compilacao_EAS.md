# LaMPS - Guia de Compilação Oficial (EAS Build)
*Documento de execução das Builds de Lançamento V1.0.0 do PAJEclub.*

A arquitetura atual (React Native + Expo) já conta com as configurações no `app.json` otimizadas para PWA e Distribuição Nativa. Para concluir o processo e enviar o aplicativo para a **Google Play Store (Android)** e **Apple App Store (iOS)**, o comando de compilação na nuvem do Expo deve ser executado no seu terminal.

## Passo 1: Autenticação
Garanta que você está logado na sua conta corporativa do Expo no terminal do Windows:
```bash
eas login
```

## Passo 2: Inicialização da Configuração de Integração (Cloud Builders)
Caso seja o primeiro mapeamento de servidores para gerar o `.aab` (Android) e o `.ipa` (Apple), inicialize o ambiente:
```bash
eas build:configure
```

## Passo 3: Geração do Arquivo Android (Google Play Store)
Gera o pacote `AAB` requerido para o Console do Google Play.
```bash
eas build --platform android --profile production
```

## Passo 4: Geração do Arquivo Apple iOS (App Store Connect)
Gera o arquivo fechado para homologação no TestFlight ou liberação pública.
```bash
eas build --platform ios --profile production
```

## Passo 5: Submissão Automática (Opcional - Requer Chaves das Lojas)
Se as chaves de API da Apple e do Google estiverem cadastradas na sua dashboard do Expo, você pode enviar automaticamente das nuvens direto para as Lojas com:
```bash
eas submit -p android
eas submit -p ios
```

---
*Versão travada em V1.0.0 pelo agente Antigravity (LaMPS). Documentação sincronizada com Obsdian Sync e Github Privado.*
