/**
 * File          : clear.js
 * Last Modified : 22/09/2020
 * Description   : Command to clear the queue
 * Author        : c-eg (Conor Egan)
 */

const Discord = require('discord.js');
let inQueue = require('../data/InQueue.js');

const embedMessageQueueCleared = new Discord.MessageEmbed()
    .setTitle('Private Matches!')
    .setColor("#b10000")
    .addField("Queue Cleared!", "To restart the queue, type: `!q`");

module.exports = {
    name: 'clear',
    description: 'Clears the queue.',
    args: false,
    usage: '',
    guildOnly: true,
    cooldown: 3,

    execute(message)
    {
        if (inQueue.users.size > 0)
        {
            inQueue.clear();
            message.channel.send(embedMessageQueueCleared);
        }
    },
};