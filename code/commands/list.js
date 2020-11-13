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
    .setFooter("Bot created by: curpha", "https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/be/bed810f8bebd7be235b8f7176e3870de1006a6e5_full.jpg");

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