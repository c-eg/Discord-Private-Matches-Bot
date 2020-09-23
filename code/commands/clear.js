/**
 * File          : clear.js
 * Last Modified : 23/09/2020
 * Description   : Command to clear the queue
 * Author        : c-eg (Conor Egan)
 */

const Discord = require('discord.js');
let inQueue = require('../data/InQueue.js');

const embedMessageQueueCleared = new Discord.MessageEmbed()
    .setTitle('Private Matches!')
    .setColor("#b10000")
    .addField("Queue Cleared!", "To restart the queue, type: `!q`")
    .setFooter("Bot created by: curpha (c-eg)", "https://cdn.cloudflare.steamstatic.com/steamcommunity/public/images/avatars/59/595a3684e667dc05e9d0d7e76efa8bb33b43a45f_full.jpg");

module.exports = {
    name: 'clear',
    description: 'Clears the queue.',
    args: false,
    usage: '',
    guildOnly: true,
    cooldown: 5,

    execute(message)
    {
        if (message.member.permissions.has('ADMINISTRATOR'))
        {
            if (inQueue.users.length > 0)
            {
                inQueue.clear();
                message.channel.send(embedMessageQueueCleared);
            }
        }
        else
        {
            message.reply("You don't have permission to clear the queue!");
        }
    },
};