/**
 * File          : list.js
 * Last Modified : 24/09/2020
 * Description   : Command to list all users in queue
 * Author        : c-eg (Conor Egan)
 */

const Discord = require('discord.js');
let inQueue = require('../data/InQueue.js');

const embedMessageUsersInQueue = new Discord.MessageEmbed()
    .setTitle('Private Matches!')
    .setColor("#b10000")
    .addField("Users in Queue: ", "filler")
    .setFooter("Bot created by: curpha (c-eg)", "https://cdn.cloudflare.steamstatic.com/steamcommunity/public/images/avatars/59/595a3684e667dc05e9d0d7e76efa8bb33b43a45f_full.jpg");

module.exports = {
    name: 'list',
    description: 'Lists users in the queue.',
    args: false,
    usage: '',
    guildOnly: true,
    cooldown: 3,

    execute(message)
    {
        if (inQueue.users.length > 0)
        {
            embedMessageUsersInQueue.fields[0].name = "Users in Queue: " + inQueue.users.length;
            embedMessageUsersInQueue.fields[0].value = inQueue.getUsersInQueue();
        }
        else
        {
            embedMessageUsersInQueue.fields[0].name = "Queue Empty";
            embedMessageUsersInQueue.fields[0].value = "No users in the queue.";
        }

        message.channel.send(embedMessageUsersInQueue);
    },
};