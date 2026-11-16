# Caça ao Bug

Jogo web para ensinar **Python** e lógica de programação a calouros de computação. Um robô atravessa cenários, encontra bugs e o aluno corrige o código de cada um escolhendo a peça certa.

Jogue online: https://samaralima.pythonanywhere.com

## Como funciona

- Ande com as setas e pule com ESPAÇO (no celular, use os botões na tela).
- Ao encontrar um bug, abre um código Python com uma lacuna. Escolha a peça correta e clique em VERIFICAR.
- Chips são coletados pelo cenário. Responder rápido dá chips de bônus, e errar custa chips.
- Para passar de mundo é preciso atingir a meta de chips. Se faltar, o mundo recomeça.

## Mundos

1. Floresta dos Loops: `while`, `for`, `range`, `break`
2. Caverna das Decisões: `if`, `else` e comparações
3. Laboratório de Funções: `def`, `return` e parâmetros

## Tecnologias

Flask (Python), HTML, CSS e JavaScript. Sem banco de dados: o progresso não é salvo entre sessões.

## Como rodar no seu computador

```
pip install -r requirements.txt
python app.py
```

Abra http://127.0.0.1:5000 no navegador.

## Estrutura

```
app.py           rotas do Flask
desafios.py      desafios, dicas e respostas (ficam no servidor)
templates/       páginas HTML
static/          imagens, CSS e JavaScript do jogo
```
Desenvolvido por ELI SAMARA OLIVEIRA DE LIMA .Sistemas de Informação . UFRPE/UAST.2026
