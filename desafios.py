# Cada desafio é um item do dicionário. Para criar uma fase nova,
# basta copiar um bloco, mudar o número e preencher os campos.
#
# "mundo":    nome do mundo (desafios com o mesmo nome formam a mesma fase do mapa)
# "fase":     posição do desafio dentro do mundo (1, 2, 3...)
# "codigo":   lista de linhas. A lacuna é marcada com ___ (três underlines).
# "pecas":    opções que o aluno pode arrastar.
# "resposta": a peça certa.
# "dicas":    o que mostrar para cada peça errada (ensina o porquê do erro).
# Os desafios de um mundo aparecem em sequência no mesmo cenário, na ordem de "fase".

MUNDO_1 = 'Floresta dos Loops'
MUNDO_2 = 'Caverna das Decisões'
MUNDO_3 = 'Laboratório de Funções'

DESAFIOS = {
    1: {
        'mundo': MUNDO_1,
        'fase': 1,
        'titulo': 'O laço que não roda',
        'enunciado': (
            'O programa deveria imprimir 0, 1 e 2, mas nada aparece na tela. '
            'Encaixe a peça certa na lacuna para corrigir o bug.'
        ),
        'codigo': [
            'contador = 0',
            'while contador ___ 3:',
            '    print(contador)',
            '    contador = contador + 1',
        ],
        'pecas': ['<', '>', '==', '<='],
        'resposta': '<',
        'dicas': {
            '>': (
                'Veja o primeiro teste: contador vale 0. '
                '0 > 3 é verdadeiro ou falso? Se for falso, o while nem começa.'
            ),
            '==': (
                'No início, contador vale 0 e 0 == 3 é falso, '
                'então o laço nunca roda. O while precisa continuar enquanto '
                'a condição for verdadeira.'
            ),
            '<=': (
                'Quase! Esse laço roda, mas também imprime o 3 '
                '(3 <= 3 é verdadeiro). O programa deve parar antes do 3.'
            ),
        },
        'acerto': (
            'Bug corrigido! Com contador < 3, o laço roda enquanto '
            'o contador for 0, 1 e 2, e para quando chega a 3.'
        ),
    },

    2: {
        'mundo': MUNDO_1,
        'fase': 2,
        'titulo': 'Quantas vezes?',
        'enunciado': (
            'O programa deve escrever "Olá!" exatamente 3 vezes, '
            'mas está escrevendo o número errado de vezes. '
            'Qual valor vai dentro do range?'
        ),
        'codigo': [
            'for i in range(___):',
            '    print("Olá!")',
        ],
        'pecas': ['2', '3', '4', '0'],
        'resposta': '3',
        'dicas': {
            '2': 'Com range(2), o laço repete só 2 vezes (i vale 0 e 1). Faltou uma.',
            '4': 'Com range(4), o laço repete 4 vezes (i vale 0, 1, 2 e 3). Passou de uma.',
            '0': 'range(0) é uma sequência vazia: o laço não repete nenhuma vez.',
        },
        'acerto': (
            'Isso! range(3) gera 0, 1 e 2, ou seja, 3 repetições. '
            'O número dentro do range diz quantas vezes o for repete.'
        ),
    },

    3: {
        'mundo': MUNDO_1,
        'fase': 3,
        'titulo': 'O laço que nunca para',
        'enunciado': (
            'O programa travou! O laço deveria contar 0, 1 e 2 e parar, '
            'mas ele nunca termina. Que operação faz o contador avançar?'
        ),
        'codigo': [
            'contador = 0',
            'while contador < 3:',
            '    print(contador)',
            '    contador ___ 1',
        ],
        'pecas': ['+=', '-=', '=', '*='],
        'resposta': '+=',
        'dicas': {
            '-=': (
                'Com -=, o contador vai para -1, -2, -3... '
                'Ele fica cada vez menor e nunca chega a 3, então o laço nunca para.'
            ),
            '=': (
                'Com =, o contador vira 1 e fica sempre 1. '
                'Ele nunca chega a 3, então o laço nunca para.'
            ),
            '*=': (
                'Com *=, 0 * 1 continua sendo 0. '
                'O contador nunca sai do lugar, então o laço nunca para.'
            ),
        },
        'acerto': (
            'Muito bem! contador += 1 soma 1 a cada volta, e o laço termina '
            'quando o contador chega a 3. Todo while precisa de algo que '
            'leve a condição a ficar falsa.'
        ),
    },

    4: {
        'mundo': MUNDO_1,
        'fase': 4,
        'titulo': 'De 1 até 5',
        'enunciado': (
            'O programa deve imprimir os números de 1 até 5, incluindo o 5. '
            'Qual valor vai no fim do range?'
        ),
        'codigo': [
            'for numero in range(1, ___):',
            '    print(numero)',
        ],
        'pecas': ['5', '6', '4', '1'],
        'resposta': '6',
        'dicas': {
            '5': (
                'Com range(1, 5), o laço vai de 1 até 4. '
                'O valor final do range nunca é incluído.'
            ),
            '4': (
                'Com range(1, 4), o laço vai de 1 até 3. '
                'O valor final do range nunca é incluído.'
            ),
            '1': 'range(1, 1) começa e termina no mesmo lugar: não repete nenhuma vez.',
        },
        'acerto': (
            'Isso! O range para um número antes do valor final, '
            'então range(1, 6) imprime 1, 2, 3, 4 e 5.'
        ),
    },

    5: {
        'mundo': MUNDO_1,
        'fase': 5,
        'titulo': 'Hora de parar',
        'enunciado': (
            'O programa deve imprimir 0, 1 e 2 e encerrar o laço assim que '
            'o número chegar a 3. Qual comando interrompe o laço?'
        ),
        'codigo': [
            'for numero in range(10):',
            '    if numero == 3:',
            '        ___',
            '    print(numero)',
        ],
        'pecas': ['break', 'continue', 'pass', 'return'],
        'resposta': 'break',
        'dicas': {
            'continue': (
                'O continue só pula o resto desta volta e segue para a próxima. '
                'O programa pularia o 3, mas continuaria com 4, 5, 6... '
                'Queremos encerrar o laço de vez.'
            ),
            'pass': (
                'O pass não faz nada. O laço continuaria até o 9 '
                'como se o if não existisse.'
            ),
            'return': (
                'O return serve para sair de uma função. Aqui não há função, '
                'então o Python dá erro. Para sair de um laço existe outro comando.'
            ),
        },
        'acerto': (
            'Floresta dos Loops concluída! O break encerra o laço na hora, '
            'por isso só aparecem 0, 1 e 2.'
        ),
    },

    # ---------- Mundo 2: Caverna das Decisões (if, elif, else) ----------
    6: {
        'mundo': MUNDO_2,
        'fase': 1,
        'titulo': 'A porta que não abre',
        'enunciado': (
            'A porta da caverna só deve abrir para quem tem 18 anos ou mais. '
            'Mas o aventureiro tem exatamente 18 anos e a porta continua fechada. '
            'Qual operador corrige o bug?'
        ),
        'codigo': [
            'idade = 18',
            'if idade ___ 18:',
            '    print("Pode entrar")',
        ],
        'pecas': ['>=', '>', '<', '=='],
        'resposta': '>=',
        'dicas': {
            '>': (
                'Quase! Mas 18 > 18 é falso, porque 18 não é maior que 18. '
                'Quem tem exatamente 18 anos continuaria de fora.'
            ),
            '<': (
                'Com <, só entra quem tem menos de 18 anos. '
                'É o contrário do que a porta deveria fazer.'
            ),
            '==': (
                'Com ==, só entra quem tem exatamente 18 anos. '
                'Alguém de 25 anos ficaria de fora. A regra é 18 ou mais.'
            ),
        },
        'acerto': (
            'Porta aberta! idade >= 18 é verdadeiro para 18 e para qualquer idade maior. '
            'O if só executa o bloco quando a condição é verdadeira.'
        ),
    },

    7: {
        'mundo': MUNDO_2,
        'fase': 2,
        'titulo': 'E se não for?',
        'enunciado': (
            'Se a energia for 50 ou mais, o robô segue em frente. '
            'Senão, ele deve recarregar. A palavra que cuida do "senão" '
            'sumiu do código. Qual é ela?'
        ),
        'codigo': [
            'energia = 30',
            'if energia >= 50:',
            '    print("Seguir em frente")',
            '___:',
            '    print("Recarregar")',
        ],
        'pecas': ['else', 'elif', 'if', 'then'],
        'resposta': 'else',
        'dicas': {
            'elif': (
                'O elif precisa de uma condição logo depois (por exemplo, elif energia < 50:). '
                'Sozinho, ele causa erro. Para o "senão" puro existe outra palavra.'
            ),
            'if': (
                'Um if também precisa de uma condição, e ele abriria uma decisão nova, '
                'não o "caso contrário" da anterior.'
            ),
            'then': (
                'Em Python não existe "then". Essa palavra é de outras linguagens. '
                'Aqui o "senão" tem outro nome.'
            ),
        },
        'acerto': (
            'Isso! O else roda quando a condição do if é falsa, e não leva condição nenhuma. '
            'Com energia = 30, o robô vai recarregar.'
        ),
    },

    8: {
        'mundo': MUNDO_2,
        'fase': 3,
        'titulo': 'Mais de dois caminhos',
        'enunciado': (
            'Nota 7 ou mais é Aprovado, nota entre 5 e 7 é Recuperação, '
            'e abaixo de 5 é Reprovado. Mas o programa está mostrando duas mensagens '
            'para quem tira 9. Qual palavra liga a segunda condição à primeira?'
        ),
        'codigo': [
            'nota = 9',
            'if nota >= 7:',
            '    print("Aprovado")',
            '___ nota >= 5:',
            '    print("Recuperação")',
            'else:',
            '    print("Reprovado")',
        ],
        'pecas': ['elif', 'if', 'else', 'elseif'],
        'resposta': 'elif',
        'dicas': {
            'if': (
                'Um segundo if é uma decisão independente da primeira. '
                'Com nota 9, o primeiro if mostra Aprovado e o segundo também é verdadeiro, '
                'então aparece Recuperação junto. É exatamente o bug.'
            ),
            'else': (
                'O else não aceita condição: "else nota >= 5:" dá erro. '
                'Para o "senão, se..." existe uma palavra que junta as duas coisas.'
            ),
            'elseif': (
                'Em Python não existe "elseif" (ele aparece em outras linguagens). '
                'Aqui a palavra é mais curta.'
            ),
        },
        'acerto': (
            'Muito bem! O elif só é testado quando o if anterior falhou, '
            'então com nota 9 só aparece Aprovado. Um bloco if, elif e else escolhe apenas um caminho.'
        ),
    },

    9: {
        'mundo': MUNDO_2,
        'fase': 4,
        'titulo': 'A faixa da prata',
        'enunciado': (
            'Medalha de Ouro é de 90 pontos para cima. Prata vai de 60 a 89 pontos. '
            'Abaixo disso, é Bronze. Que valor completa a condição da Prata?'
        ),
        'codigo': [
            'pontos = 75',
            'if pontos >= 90:',
            '    print("Ouro")',
            'elif pontos >= ___:',
            '    print("Prata")',
            'else:',
            '    print("Bronze")',
        ],
        'pecas': ['60', '89', '90', '100'],
        'resposta': '60',
        'dicas': {
            '89': (
                'Com >= 89, quem tem 75 pontos não entra na Prata e cai no else, virando Bronze. '
                'A Prata começa bem antes.'
            ),
            '90': (
                'Quem chega ao elif já falhou no if, ou seja, tem menos de 90 pontos. '
                'Então pontos >= 90 nunca é verdadeiro ali, e a Prata nunca aparece.'
            ),
            '100': (
                'Com >= 100, quase ninguém ganha Prata, e quem tem 100 já teria ganhado Ouro no if. '
                'A Prata começa em um valor mais baixo.'
            ),
        },
        'acerto': (
            'Certo! Como o if já cuidou de 90 ou mais, o elif só precisa dizer onde a Prata começa: '
            '60. Quem tem menos que isso vai para o else.'
        ),
    },

    10: {
        'mundo': MUNDO_2,
        'fase': 5,
        'titulo': 'Do mais exigente ao menos',
        'enunciado': (
            'Acima de 30 graus é "Muito calor", acima de 20 é "Calor", e o resto é "Frio". '
            'A temperatura é 35. Que valor completa a primeira condição '
            'para o programa mostrar o resultado certo para qualquer temperatura?'
        ),
        'codigo': [
            'temperatura = 35',
            'if temperatura > ___:',
            '    print("Muito calor")',
            'elif temperatura > 20:',
            '    print("Calor")',
            'else:',
            '    print("Frio")',
        ],
        'pecas': ['30', '20', '10', '15'],
        'resposta': '30',
        'dicas': {
            '20': (
                'Com > 20 no if, o elif (que também testa > 20) nunca roda. '
                'Uma temperatura de 25 graus viraria "Muito calor". '
                'O if precisa ser a condição mais exigente.'
            ),
            '10': (
                'Com > 10, até 15 graus viraria "Muito calor", e o elif nunca seria testado. '
                'O if tem que ser mais exigente que o elif.'
            ),
            '15': (
                'Com > 15, uma temperatura de 25 graus viraria "Muito calor" '
                'e o elif nunca seria testado. A primeira condição deve ser a mais exigente.'
            ),
        },
        'acerto': (
            'Caverna das Decisões concluída! O Python testa de cima para baixo e para no primeiro '
            'caminho verdadeiro, por isso a condição mais exigente vem primeiro.'
        ),
    },
    11: {
        'mundo': MUNDO_3,
        'fase': 1,
        'titulo': 'Ensinando uma receita ao robô',
        'enunciado': (
            'Uma função é uma "receita" que você escreve uma vez e usa quantas vezes quiser. '
            'Que palavra do Python cria uma função?'
        ),
        'codigo': [
            '___ ligar_maquina():',
            '    print("Máquina ligada!")',
        ],
        'pecas': ['def', 'function', 'func', 'fun'],
        'resposta': 'def',
        'dicas': {
            'function': (
                'Em outras linguagens, como JavaScript, é assim. '
                'No Python a palavra é bem mais curta: ela vem de "define" (definir).'
            ),
            'func': 'Boa tentativa, mas "func" não existe no Python. A palavra vem de "define" (definir).',
            'fun': 'Quase divertido, mas "fun" não é do Python. Para definir uma função usamos a abreviação de "define".',
        },
        'acerto': (
            'Isso! def (de "define") cria uma função. Daqui para frente, '
            'ligar_maquina() é uma receita pronta para usar.'
        ),
    },
    12: {
        'mundo': MUNDO_3,
        'fase': 2,
        'titulo': 'A primeira linha da função',
        'enunciado': (
            'A primeira linha de uma função termina com um símbolo que avisa: '
            '"o que vem agora, indentado, faz parte da função". Qual é esse símbolo?'
        ),
        'codigo': [
            'def ligar_luz()___',
            '    print("Luz acesa!")',
        ],
        'pecas': [':', ';', '.', '{'],
        'resposta': ':',
        'dicas': {
            ';': 'O ponto e vírgula é usado em outras linguagens para terminar linhas. No Python, a primeira linha de uma função termina com outro símbolo.',
            '.': 'O ponto serve para outras coisas, como separar casas decimais. Aqui precisamos de um símbolo que abre o bloco da função.',
            '{': 'As chaves abrem blocos em outras linguagens. No Python, quem faz isso é um símbolo mais simples, seguido do código indentado.',
        },
        'acerto': (
            'Exato! Os dois-pontos (:) abrem o bloco, e o código indentado logo abaixo é o corpo da função.'
        ),
    },
    13: {
        'mundo': MUNDO_3,
        'fase': 3,
        'titulo': 'Devolvendo o resultado',
        'enunciado': (
            'A função dobro recebe um número e precisa entregar o resultado de volta '
            'para quem a chamou. Qual palavra faz a função devolver um valor?'
        ),
        'codigo': [
            'def dobro(n):',
            '    ___ n * 2',
        ],
        'pecas': ['return', 'print', 'give', 'break'],
        'resposta': 'return',
        'dicas': {
            'print': (
                'print só mostra o valor na tela, mas não o entrega para o resto do programa usar. '
                'Precisamos de algo que devolva o valor.'
            ),
            'give': 'Tem a ideia certa, mas "give" não existe no Python. A palavra significa "retornar", em inglês.',
            'break': '"break" serve para sair de um laço, não para devolver um valor de uma função.',
        },
        'acerto': (
            'Perfeito! return devolve o valor para quem chamou a função e encerra a função.'
        ),
    },
    14: {
        'mundo': MUNDO_3,
        'fase': 4,
        'titulo': 'Ligando a máquina',
        'enunciado': (
            'Criar a função não executa nada: ela só ensina a receita. '
            'Para rodar a função dobro com o número 5, o que falta na última linha?'
        ),
        'codigo': [
            'def dobro(n):',
            '    return n * 2',
            '',
            'resultado = dobro___',
            'print(resultado)   # mostra 10',
        ],
        'pecas': ['(5)', '[5]', '= 5', '5'],
        'resposta': '(5)',
        'dicas': {
            '[5]': 'Colchetes são usados em listas. Para chamar uma função, o valor vai entre parênteses.',
            '= 5': 'Isso guardaria o número 5 e não chamaria a função. Para chamar, o valor vai entre parênteses logo depois do nome.',
            '5': 'Sem parênteses, o Python não entende que é uma chamada de função. Chamamos assim: nome(valor).',
        },
        'acerto': (
            'Isso! dobro(5) chama a função, que devolve 10. Definir é ensinar a receita, chamar é cozinhar.'
        ),
    },
    15: {
        'mundo': MUNDO_3,
        'fase': 5,
        'titulo': 'Dando ingredientes à função',
        'enunciado': (
            'Quero que a função cumprimente qualquer pessoa, e não só uma. '
            'Que nome vai entre os parênteses para receber o nome da pessoa?'
        ),
        'codigo': [
            'def saudacao(___):',
            '    print("Olá, " + nome + "!")',
            '',
            'saudacao("Ana")   # Olá, Ana!',
        ],
        'pecas': ['nome', '"Ana"', 'saudacao', '5'],
        'resposta': 'nome',
        'dicas': {
            '"Ana"': (
                'Esse é o valor que passamos na hora de chamar. Dentro do def vai o nome da variável '
                'que vai receber esse valor, e é o mesmo usado no print.'
            ),
            'saudacao': 'Esse é o nome da própria função. Aqui precisamos do nome da variável usada dentro dela, no print.',
            '5': 'Um número não pode ser nome de parâmetro. Veja qual nome a linha do print usa.',
        },
        'acerto': (
            'Laboratório de Funções concluído! O parâmetro (nome) é um espaço reservado: '
            'cada chamada, como saudacao("Ana"), preenche esse espaço com um valor diferente.'
        ),
    },
}


# Mundos do mapa. O número é o mesmo usado na rota /mundo/<número>.
MUNDOS = {
    1: {'nome': MUNDO_1},
    2: {'nome': MUNDO_2},
    3: {'nome': MUNDO_3},
}