const { createBot, createProvider, createFlow, addKeyword, EVENTS } = require('@bot-whatsapp/bot')
require('dotenv').config()

const QRPortalWeb = require('@bot-whatsapp/portal')
const BaileysProvider = require('@bot-whatsapp/provider/baileys')
// const MockAdapter = require('@bot-whatsapp/database/mock')
const MongoAdapter = require('@bot-whatsapp/database/mongo')
const path = require('path')
const fs = require('fs')

// Lee los archivos de texto necesarios
const menuPath = path.join(__dirname, 'mensajes', 'menu.txt')
const menu = fs.readFileSync(menuPath, 'utf8')

const pathConsultas = path.join(__dirname, 'mensajes', 'promptConsultas.txt')
const promptConsultas = fs.readFileSync(pathConsultas, 'utf8')

// Define los flujos de voz y chatgpt------------------------------------------------------------------- (DESACTIVADOS)
// const flowVoice = addKeyword(EVENTS.VOICE_NOTE).addAnswer('Esta es una nota de voz', null, async (ctx, ctxFn) => {
//     const text = await handlerAI(ctx)
//     const prompt = promptConsultas
//     const consulta = text
//     const answer = await chat(prompt, consulta)
//     await ctxFn.flowDynamic(answer.content)
// })

const flowWelcome = addKeyword(EVENTS.WELCOME)
    .addAnswer('Bienvenido a *POWERFIBER*', {
        delay: 100,
    })
    .addAnswer('Para obtener mas informacion, escribi *info*.', {
        delay: 500,
    })

const flowPagWeb = addKeyword(EVENTS.ACTION)
    .addAnswer('Ingresa a nuestra pagina web:')
    .addAnswer( 'https://www.power-fiber.net')
    

const flowCatalogo = addKeyword(EVENTS.ACTION)
    .addAnswer('Aca esta el catalogo de todos nuestros productos:')
    .addAnswer('https://drive.google.com/file/d/1Cw0yJxgC5gFvsZlrhINWdOqh4t2R9HwT/view')

const flowAsistencia = addKeyword(EVENTS.ACTION)
    .addAnswer('Para comunicarte con un asesor personal comunicate al:')
    .addAnswer('0800-362-4567')
    
const menuFlow = addKeyword('info').addAnswer(
    menu,
    { capture: true },
    async (ctx, { gotoFlow, fallBack, flowDynamic }) => {
        if (!['1', '2', '3', '0'].includes(ctx.body)) {
            return fallBack(
                'Respuesta no válida, por favor selecciona una de las opciones.'
            );
        }
        switch (ctx.body) {
            case '1':
                return gotoFlow(flowPagWeb);
            case '2':
                return gotoFlow(flowCatalogo);
            case '3':
                return gotoFlow(flowAsistencia);
            case '0':
                return await flowDynamic(
                    "Saliendo... Puedes volver a acceder a este menú escribiendo '*info*'"
                );
        }
    }
);

const main = async () => {
    const adapterDB = new MongoAdapter({
        dbUri: process.env.MONGO_DB_URI,
        dbName: 'PowerTest'
    })
    const adapterFlow = createFlow([flowWelcome, menuFlow, flowPagWeb, flowCatalogo, flowAsistencia])
    const adapterProvider = createProvider(BaileysProvider)

    createBot({
        flow: adapterFlow,
        provider: adapterProvider,
        database: adapterDB,
    })

    QRPortalWeb()
}

main()
