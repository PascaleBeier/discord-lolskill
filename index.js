const Discord = require('discord.js');
const chromeLauncher = require('lighthouse/chrome-launcher/chrome-launcher');
const CDP = require('chrome-remote-interface');
const fs = require('fs');
const sharp = require('sharp');

const width = 1280;
const height = 1100;
const cropOffTop = 308;
const launchConfig = {
    chromeFlags: [
        `--window-size=${width},${height}`,
        '--disable-gpu',
        '--headless'
    ]
};
const botToken = 'MzI4OTI2MTA3MDMyMDkyNjgy.DDK_5A.i55kp8SlziJr3VfYu3d4QuE3I1c';
const commandPrefix = '!lolskill';
const commandDelimiter = '\"';
const client = new Discord.Client();

formatCommand = message => {
    const args = message.content.split(commandDelimiter);
    if (!args || args.length < 2) {
        return message.reply(`Usage: ${commandPrefix} ${commandDelimiter}${message.author.username}${commandDelimiter}`);
    }
    return lookup(args[1], message);
};

lookup = async (summoner, message) => {
    const chrome = await chromeLauncher.launch(launchConfig);
    const protocol = await CDP({port: chrome.port});
    const {Page, Runtime} = protocol;

    await Promise.all([Page.enable(), Runtime.enable()]);

    const lolSkillUrl = `http://www.lolskill.net/game/EUW/${encodeURI(summoner)}`;

    Page.navigate({url: lolSkillUrl});

    Page.loadEventFired(async () => {
        const {data} = await Page.captureScreenshot();

        sharp(Buffer.from(data, 'base64'))
            .extract({left: 30, top: cropOffTop, width: width - 75, height: height - cropOffTop - 10})
            .webp({quality: 100, lossless: true})
            .toBuffer((err, data) => {
                message.reply({files: [{attachment: data, name: 'lolskill.webp'}]});
            });

        protocol.close();
        chrome.kill();
    });
};

client.on('message', msg => {
    if (msg.content.startsWith(commandPrefix)) {
        formatCommand(msg);
    }
});

client.login(botToken);
