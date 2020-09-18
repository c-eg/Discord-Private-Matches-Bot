/**
 * File          : leave.js
 * Last Modified : 18/09/2020
 * Description   : Command to leave the queue
 * Author        : c-eg (Conor Egan)
 */

const Discord = require('discord.js');
let inQueue = require('../data/InQueue.js');

const embedMessageLeaveQueue = new Discord.MessageEmbed()
    .setTitle('Private Matches!')
    .setColor("#b10000")
    .addField("User Left the Queue", "filler")
    .addField("Users in Queue: ", "filler");

module.exports = {
    name: 'leave',
    description: 'Leaves the current queue.',
    args: false,
    usage: '',
    guildOnly: true,
    cooldown: 2,
    aliases: ['l'],

    execute(message, args)
    {
        inQueue.remove(message.member.user);

        // if there's more than 1 user in the queue
        if (inQueue.users.size > 0)
        {
            embedMessageLeaveQueue.fields[1].name = "Users in Queue: " + inQueue.users.size;
            embedMessageLeaveQueue.fields[1].value = inQueue.getUsersInQueue();
        }
        else
        {
            embedMessageLeaveQueue.fields[1].name = "Queue Empty";
            embedMessageLeaveQueue.fields[1].value = "No users in the queue.";
        }

        // set EmbedMessage to the string
        embedMessageLeaveQueue.fields[0].value = message.member.user.toString() + " left the queue.";

        // send the message
        message.channel.send(embedMessageLeaveQueue);
    },
};