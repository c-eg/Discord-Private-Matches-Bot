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
    .setFooter("Bot created by: curpha", "https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/be/bed810f8bebd7be235b8f7176e3870de1006a6e5_full.jpg");

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