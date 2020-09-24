/**
 * File          : app.js
 * Last Modified : 23/09/2020
 * Description   : Discord bot for private 6 person matches
 * Author        : c-eg (Conor Egan)
 */

/**
 * TODO:
 *  - check mmr command
 *   - !peak <user>, would sho
 *  - add timeout command
 *
 *  Extra features:
 *  TODO:
 *   - Create own bot role
 *   - Add multi-server support
 *    - Each server must have their own queue
 *   - Add option to queue for a time: !q 10 would queue for 10 mins
 */

// requires
const fs = require('fs');                           // get node js file system
const Discord = require("discord.js");              // get discord.js
const config = require("./config.json");            // get config.json

const discordClient = new Discord.Client();         // discord client
discordClient.commands = new Discord.Collection();  // new map for commands

const commandFiles = fs.readdirSync('./commands')
    .filter(file => file.endsWith('.js'));          // read in command files

// loop through commands, adding them to the collection of commands
for (const file of commandFiles)
{
    const command = require(`./commands/${file}`);

    // set a new item in the Collection
    // with the key as the command name and the value as the exported module
    discordClient.commands.set(command.name, command);
}

const cooldowns = new Discord.Collection();         // new map for cooldowns

// log to console bot is ready
discordClient.once('ready', () => {
    console.log('UEA 6 Mans bot is ready!');
    discordClient.user.setActivity('Callum and Harry shout at each other', { type: 'LISTENING' });
});

discordClient.on("message", function(message)
{
    // if bot or message doesn't start with prefix, do nothing
    if (message.author.bot || !message.content.startsWith(config.PREFIX))
        return;
    else if (message.channel.name !== config.CHANNEL_NAME)
        return;
    else
    {
        // get args and command name
        const args = message.content.slice(config.PREFIX.length).trim().split(/ +/);
        const commandName = args.shift().toLowerCase();

        // get commands from collection, including command aliases
        const command = discordClient.commands.get(commandName)
            || discordClient.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

        if (!command) return;

        // if command can only be used in a server, and it was sent in a DM
        if (command.guildOnly && message.channel.type === "dm")
        {
            return message.reply("I can\'t execute that command inside a direct message.");
        }

        // if the command requires args and the correct args aren't supplied
        if (command.args && (args.length !== command.argsLength || !args.length))
        {
            let reply = `You didn\'t provide the correct arguments, ${message.author}!`;

            // if command file includes usage
            if (command.usage)
            {
                reply += `\nUsage: \'${config.PREFIX}${command.name} ${command.usage}\'`;
            }

            return message.channel.send(reply);
        }

        // check if the cooldowns collection has the command, if not add it
        if (!cooldowns.has(command.name))
        {
            cooldowns.set(command.name, new Discord.Collection());
        }

        let now = Date.now();
        let timeStamps = cooldowns.get(command.name);
        let cooldownAmount = (command.cooldown || 1) * 3000;

        // if the timeStamp contains the author of the message already
        if (timeStamps.has(message.author.id))
        {
            const expirationTime = timeStamps.get(message.author.id) + cooldownAmount;

            // check the message is before the cooldown period
            if (now < expirationTime)
            {
                let timeLeft = (expirationTime - now) / 1000;
                return message.reply(`Please wait ${timeLeft} more second(s) before reusing the \`${command.name}\` command.`);
            }
        }

        // add user to timeStamps mapped to when they sent it
        timeStamps.set(message.author.id, now);

        // delete entry in map after cooldown period has passed
        setTimeout(() => timeStamps.delete(message.author.id), cooldownAmount);

        // try executing the command
        try
        {
            command.execute(message, args);
        }
        catch (error)
        {
            console.error(error);
            message.reply("There was an error trying to execute that command...");
        }
    }
})

discordClient.login(config.BOT_TOKEN);