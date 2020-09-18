/**
 * File          : app.js
 * Last Modified : 18/09/2020
 * Description   : Discord bot for private 6 person matches
 * Author        : c-eg (Conor Egan)
 */

/**
 * todo:
 *  - currently up to command aliases!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
 *  - !setpeak command should store the users peak mmr in db
 *  - !help should list all commands
 *  - Add commands for admins/mods to clear queue etc.
 *
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
client.once('ready', () => {
    console.log('Ready!');
});


// // set to store users in queue
// let users = new Set();
//
// // template for EmbedMessage when a user starts a queue
// const embedMessageStartedQueue = new Discord.MessageEmbed()
//     .setTitle('Private Matches!')
//     .setColor("#b10000")
//     .addField("A queue has started!", "filler");
//
// const embedMessageJoinedQueue = new Discord.MessageEmbed()
//     .setTitle('Private Matches!')
//     .setColor("#b10000")
//     .addField("User Joined!", "filler")
//     .addField("Users in Queue: ", "filler");
//
// const embedMessageLeaveQueue = new Discord.MessageEmbed()
//     .setTitle('Private Matches!')
//     .setColor("#b10000")
//     .addField("User Left the Queue", "filler")
//     .addField("Users in Queue: ", "filler");
//
// const embedMessageQueueFull = new Discord.MessageEmbed()
//     .setTitle('Private Matches!')
//     .setColor("#b10000")
//     .addField("Queue Full, Players in Queue: ", "filler")
//     .addField("Vote Method", "filler");
//
// const embedMessageMatchStarted = new Discord.MessageEmbed()
//     .setTitle('Private Matches!')
//     .setColor("#b10000")
//     .addField("Team 1", "filler")
//     .addField("Team 2", "filler");

discordClient.on("message", function(message)
{
    // if bot or message doesn't start with prefix, do nothing
    if (message.author.bot || !message.content.startsWith(config.PREFIX))
        return;
    else
    {
        // get args and command name
        const args = message.content.slice(config.PREFIX.length).trim().split(/ +/);
        const commandName = args.shift().toLowerCase();

        // if the command isn't a commands, do nothing
        if (!discordClient.commands.has(commandName))
            return;

        // get commands from collection
        const command = discordClient.commands.get(commandName);

        if (command.guildOnly && message.channel.type === "dm")
        {
            return message.reply("I can\'t execute that command inside a direct message.");
        }

        // if the command requires args and the correct args aren't supplied
        if (command.args && !args.length)
        {
            let reply = "You didn't provide any arguments, ${message.author}!";

            // if command file includes usage
            if (command.usage)
            {
                reply += "\nUsage: \'${config.PREFIX}${command.name} ${command.usage}\'";
            }

            return message.channel.send(reply);
        }

        // check if the cooldowns collection has the command, if not add it
        if (!cooldowns.has(command.name))
        {
            cooldowns.set(command.name, new Discord.Collection());
        }

        const now = Date.now();
        const timeStamps = cooldowns.get(command.name);
        const cooldownAmount = (command.cooldown) * 3000;

        // if the timeStamp contains the author of the message already
        if (timeStamps.has(message.author.id))
        {
            const expirationTime = timeStamps.get(message.author.id) + cooldownAmount;

            // check the message is before the cooldown period
            if (now < expirationTime)
            {
                const timeLeft = (expirationTime - now) / 1000;
                return message.reply("Please wait ${timeLeft} more second(s) before reusing the \`${command.name}\` command.");
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

// function getUsersInQueue()
// {
//     let inQueue = "";
//
//     for (const item of users.values())
//         inQueue += item.toString() + ' ';
//
//     return inQueue;
// }