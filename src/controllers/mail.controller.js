const service = require('../services/service.js')

require('dotenv').config()

module.exports = {
    sendEmailToken: ({email, token, player}) => {

        const html = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Document</title>
            </head>
            <style type="text/css">
                body {
                    margin: 0;
                    background-color: #cccccc;
                }
                table {
                    border-spacing: 0;
                }
                td {
                    padding: 0;
                }
                .wrapper {
                    background-color: #cccccc;
                    width: 100%;
                    table-layout: fixed;
                    padding-bottom: 60px;
                }
    
                .main {
                    background-color: #ffffff;
                    margin: 0 auto;
                    width: 100%;
                    max-width: 600px;
                    border-spacing: 0;
                    font-family: sans-serif;
                    color: #171a1b;
                }
                
            </style>
            <body>
    
                <center class="wrapper">
                    <table class="main" width="100%">
    
                        <tr>
                            <td height="8" style="background-color: #171a1b;"></td>
                        </tr>
                        <tr>
                            <td class="header" style="background-color: #ffffff; padding: 20px; text-align: center; font-size: 24px;">
                                <h1>Confirmar seu cadastro</h1>
                            </td>
                        </tr>
    
                        <tr>
                            <td>
                                <table width="100%">
                                    <tr>
                                        <td class="body" style="background-color: #ffffff; padding: 20px; text-align: left; font-size: 16px; line-height: 1.6;">
                                            <p>Olá, ${player}! <br>
                                            Para que todas as funcionalidades do site sejam liberadas precisamos verificar seu e-mail.</p>
                                            <p>Caso tenha sido voce, clique no link abaixo para confirmar seu cadastro:</p>
                                            <br>
                                            <a href="http://localhost:4200/#/confirm/acc/verification/${email}/${token}">Clique aqui</a>
                                </table>
                            </td>
                        </tr>
    
                    </table>
                </center>
                
            </body>
            </html>
        `
        const subject = 'Confirmar seu cadastro'
        return service.sendMail({email: email, html: html, subject: subject})
    },

    sendEmailConfirmed: ({email, player}) => {
        const html = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Document</title>
        </head>
        <style type="text/css">
            body {
                margin: 0;
                background-color: #cccccc;
            }
            table {
                border-spacing: 0;
            }
            td {
                padding: 0;
            }
            .wrapper {
                background-color: #cccccc;
                width: 100%;
                table-layout: fixed;
                padding-bottom: 60px;
            }

            .main {
                background-color: #ffffff;
                margin: 0 auto;
                width: 100%;
                max-width: 600px;
                border-spacing: 0;
                font-family: sans-serif;
                color: #171a1b;
            }
            
        </style>
        <body>

            <center class="wrapper">
                <table class="main" width="100%">

                    <tr>
                        <td height="8" style="background-color: #171a1b;"></td>
                    </tr>
                    <tr>
                        <td class="header" style="background-color: #ffffff; padding: 20px; text-align: center; font-size: 24px;">
                            <h1>Cadastro concluído</h1>
                        </td>
                    </tr>

                    <tr>
                        <td>
                            <table width="100%">
                                <tr>
                                    <td class="body" style="background-color: #ffffff; padding: 20px; text-align: left; font-size: 16px; line-height: 1.6;">
                                    <p>Olá, ${player}! <br>
                                    Seu cadastro foi concluído com sucesso.</p>
                                    <br>
                                    <p>Agora você pode acessar todas as funcionalidades do site.</p>
                                    <br>
                                    <p>Seja bem vindo a versão BETA do OtP2P.</p>
                                    <br>
                                    <p>Lembrando que este projeto está em desenvolvimento. Não recomendamos fazer trocas reais, nenhum dinheiro pode ser depositado ou sacado de verdade.</p>
                                    <br>
                                    <p>Neste momento queremos disponibilizar uma versão para que os players testem e deixem seu feedback e sugestões.</p>
                            </table>
                        </td>
                    </tr>

                </table>
            </center>
            
        </body>
        </html>
    `
        const subject = 'Seja bem vindo!'
        return service.sendMail({email: email, html: html, subject: subject})
    }
}