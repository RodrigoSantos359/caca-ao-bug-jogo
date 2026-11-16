import os
import random

from flask import Flask, render_template, request, jsonify, abort, url_for

from desafios import DESAFIOS, MUNDOS

app = Flask(__name__)


# Endereço dos arquivos CSS/JS com a data da última alteração (?v=...).
# Assim, quando um arquivo muda, o navegador baixa a versão nova em vez de usar a antiga guardada no cache.
@app.context_processor
def versao_dos_estaticos():
    def estatico(arquivo):
        try:
            versao = int(os.path.getmtime(os.path.join(app.static_folder, arquivo)))
        except OSError:
            versao = 0
        return url_for('static', filename=arquivo, v=versao)
    return {'estatico': estatico}


# Tela inicial
@app.route('/')
def index():
    return render_template('index.html')


# Mapa de mundos
@app.route('/minimundos')
def minimundos():
    return render_template('minimundos.html')


# Um mundo inteiro: o robô anda pelo cenário e enfrenta um bug por desafio
@app.route('/mundo/<int:mundo_id>')
def mundo(mundo_id):
    info = MUNDOS.get(mundo_id)
    if info is None:
        abort(404)

    do_mundo = sorted(
        (par for par in DESAFIOS.items() if par[1]['mundo'] == info['nome']),
        key=lambda par: par[1]['fase'],
    )

    # Só enviamos para o navegador o que o aluno pode ver.
    # A resposta correta e as dicas ficam apenas no servidor.
    publico = [
        {
            'id': desafio_id,
            'fase': d['fase'],
            'titulo': d['titulo'],
            'enunciado': d['enunciado'],
            'codigo': d['codigo'],
            'pecas': random.sample(d['pecas'], len(d['pecas'])),
        }
        for desafio_id, d in do_mundo
    ]
    return render_template(
        'mundo.html', mundo_id=mundo_id, nome=info['nome'], desafios=publico
    )


# Validação da peça encaixada
@app.route('/validar-desafio', methods=['POST'])
def validar_desafio():
    corpo = request.get_json(silent=True) or {}
    desafio_id = corpo.get('id')
    resposta = str(corpo.get('resposta') or '').strip()

    dados = DESAFIOS.get(desafio_id)
    if dados is None:
        return jsonify({'sucesso': False, 'mensagem': 'Desafio não encontrado.'}), 404

    if resposta == dados['resposta']:
        return jsonify({'sucesso': True, 'mensagem': dados['acerto']})

    dica = dados['dicas'].get(
        resposta,
        'Essa peça não resolve o bug. Releia o código e tente outra.'
    )
    return jsonify({'sucesso': False, 'mensagem': dica})


if __name__ == '__main__':
    app.run(debug=True)
