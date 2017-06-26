const Discord = require("discord.js");
const client = new Discord.Client();

const botToken = 'MzI4OTI2MTA3MDMyMDkyNjgy.DDK_5A.i55kp8SlziJr3VfYu3d4QuE3I1c';
const botSecret = 'z0Umgo6QKyH97EndDPHMh3_RGNmo-XCb';

const commandPrefix = '!lolskill';
const commandDelimiter = '\"';

const help = 'Usage: !lolskill "Salty Fizz"';

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', msg => {
  if (msg.content.startsWith(commandPrefix)) {
    formatCommand(msg);
  }
});

formatCommand = message => {
  const args = message.content.split(commandDelimiter);
  if (!args || args.length < 2) {
    return message.reply(help);
  } else {
    return lookup(args[1], message);
  }
};

client.login(botToken);

lookup = (summoner, message) => {
    const chromeLauncher = require('lighthouse/chrome-launcher/chrome-launcher');
    const CDP = require('chrome-remote-interface');
    const fs = require('fs');
    const launchConfig = {
        chromeFlags: [
            `--window-size=1024,1024`,
            '--disable-gpu',
            '--headless'
        ]
    };

    (async function() {
        const chrome = await chromeLauncher.launch(launchConfig);
        const protocol = await CDP({port: chrome.port});
        const {Page, Runtime} = protocol;

        await Promise.all([Page.enable(), Runtime.enable()]);

        const lolSkillUrl = `http://www.lolskill.net/game/EUW/${encodeURI(summoner)}`;

        Page.navigate({url: lolSkillUrl});

        Page.loadEventFired(async () => {
            const { data } = await Page.captureScreenshot({fromSurface: true});
            fs.writeFileSync('result.png', data, 'base64');
            protocol.close();
            chrome.kill(); // Kill Chrome.
            message.reply({ files: ['./result.png']});

            //message.reply({'embed': {
             //   title: result.result.value,
             //   url: lolSkillUrl,
             //   image: {
             //       url: './demo.png'
             //   }
            //}});
        });


    })();
};

