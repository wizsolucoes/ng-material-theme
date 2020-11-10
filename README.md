# Wiz Angular Material Schematic

Adicione o Angular Material com a folha de estilos da Wiz ao seu projeto.

## Uso

```bash
ng add @wizsolucoes/ng-material-theme
```

## Sobre
Este schematic instala os pacotes npm [@angular/material](https://www.npmjs.com/package/@angular/material),
cria os arquivos da folha de estilo da Wiz e atualiza o 'styles.scss' para importar
as folhas de estilo, customizando o Angular Material.

O schematics permite a instalação da folha de estilos em aplicações normais e
white label, bastando informar "true" ou "false" na flag '--white-label' no momento
da execução do schematic.

## Desenvolvimento, por onde começar
```bash
# Instalar as dependências
npm install

# Buildar schematic
npm run build

# Executar os testes
npm test
```

### Testando o schematic localmente
#### 1. Gere um distribuível do schematic

```bash
# Instalar as dependências
npm install

# Buildar schematic
npm run build

# Gerar tarball eg. wizsolucoes-ng-material-theme-0.0.1-0.tgz
npm pack
```

#### 2. Instale e execute o schematic na raiz de qualquer aplicação

```bash
# Instalar schematic
npm i --no-save ../path/to/ng-material-theme/wizsolucoes-ng-material-theme-0.0.1-0.tgz

# Executar schematic
# --white-label=true instala o tema para aplicações white label
# --white-label=false ou omitindo a flag instala o tema para aplicações normais
ng g @wizsolucoes/ng-material-theme:ng-add --white-label=<true | false>