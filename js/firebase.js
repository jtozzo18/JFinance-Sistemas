
const firebaseConfig = {
    apiKey: "AIzaSyCyMmxBglDAMLiuUguHZHB3vonyYGGPRSc",
    authDomain: "gti-projeto-despesas.firebaseapp.com",
    projectId: "gti-projeto-despesas",
    storageBucket: "gti-projeto-despesas.appspot.com",
    messagingSenderId: "957547230469",
    appId: "1:957547230469:web:b4e5392c76f94b0c1c336c"
  };

//inicializando o firebase
firebase.initializeApp(firebaseConfig)
//definindo a URL padra do site
const urlApp = "http://127.0.0.1:5500/index.html"

function logaGoogle() {
    //alert('Você clicou💛')//tecla windows + . para inserir o emoji
    const provider = new firebase.auth.GoogleAuthProvider()
    firebase.auth().signInWithPopup(provider)
        .then((result) => {
            window.location.href = 'menu.html'
        }).catch((error) => {
            alert(`erro ao efetuar o login: $(error.message}`)
        })
}

function verificaLogado() {
    firebase.auth().onAuthStateChanged(user => {
        if (user) {

            localStorage.setItem('usuarioId', user.uid)

            let imagem = document.getElementById('imagemUsuario')

            user.photoURL
                ? imagem.innerHTML += `<img src="${user.photoURL}" title="${user.displayName}" class="img rounded-circle" width="48 " />`
                : imagem.innerHTML += '<img src="images/logo-google.svg" title="Usuario sem foto" class="img rounded-circle" width="32" />'

        } else {
            localStorage.removeItem('usuarioId')
            window.location.href = 'index.html'
        }
    })
}

function logoutFirebase() {
    firebase.auth().signOut()
        .then(function () {
            localStorage.removeItem('usuarioId')
            window.location.href = 'index.html'
        })
        .catch(function (error) {
            alert('Não foi possivel efetuar o logout: ${error.message}')

        })
}

async function salvaFinanca(financa) {
    //obtendo o usuário atual
    let usuarioAtual = firebase.auth().currentUser
    try {
        await firebase.database().ref('financeiro').push({
            ...financa,
            usuarioInclusao: {
                uid: usuarioAtual.uid,
                nome: usuarioAtual.displayName
            }
        })
        alert('✔ Registro incluído com sucesso!')
        //limpar o formulário
        document.getElementById('formDespesa').reset()
    } catch (error) {
        alert(`❌Erro ao salvar: ${error.message}`)
    }
}
//evento submit do formulário
document.getElementById('formDespesa').addEventListener('submit', function (event) {
    event.preventDefault() // evita o carregamento
    const financa = {
        descricao: document.getElementById('descricao').value,
        valor: document.getElementById('valor').value,
        categoria: document.getElementById('categoria').value,
        data: document.getElementById('data').value,
        recorrente: document.getElementById('recorrente').checked

    }
    salvaFinanca(financa)
})

async function carregaFinanca() {
    const tabela = document.getElementById('dadosTabela')
    const usuarioAtual = localStorage.getItem('usuarioId')

    await firebase.database().ref('financeiro').orderByChild('descricao')
        .on('value', (snapshot) => {
            //Limpamos a tabela
            tabela.innerHTML=""
            if (!snapshot.exists()) { //não existe o snapshot?
                tabela.innerHTML = `<tr class='table-danger'><td colspan='4'>Ainda não existe nenhum registro cadastrado.</td></tr>`
            } else { //se existir o snapshot, montamos a tabela
                snapshot.forEach(item => {
                    const dados = item.val() //obtém os dados
                    const recorrente = dados.recorrente ?"Sim ✅" : "Não 🚫"
                    const id = item.key // obtém o id
                    const isUsuarioAtual = (dados.usuarioInclusao.uid === usuarioAtual)
                    const botao = isUsuarioAtual
                        ? `<button class='btn btn-sm btn-danger' onclick='removeFinanca("${id}")'
                    title='Excluir o registro atual'>🗑 Excluir</button>`
                        : `🚫 Indisponivel`

                    tabela.innerHTML += `
                <tr>
                    <td>${dados.descricao}</td>
                    <td>${dados.valor}</td>
                    <td>${dados.categoria}</td>
                    <td>${dados.data}</td>
                    <td>${recorrente}</td>
                    <td>${botao}</td>
                </tr>
                `
                })
            }
        })
}

async function removeFinanca(id) {
    if (confirm('Deseja realmente excluir a Despesa')) {
        const financaRef = await firebase.database().ref('financeiro/' + id)

        //Remova a Finança do Firebase
        financaRef.remove()
            .then(function () {
                alert('Despesa excluída com sucesso!')
            })
            .catch(function (error) {
                alert(`Erro ao excluir o Despesa: ${error.message}. Tente novamente`)
            })
    }
}