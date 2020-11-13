/**
 * File          : leave.js
 * Last Modified : 23/09/2020
 * Description   : Command to leave the queue
 * Author        : c-eg (Conor Egan)
 */

const Discord = require('discord.js');
let inQueue = require('../data/InQueue.js');

const embedMessageLeaveQueue = new Discord.MessageEmbed()
    .setTitle('Private Matches!')
    .setColor("#b10000")
    .addField("User Left the Queue", "filler")
    .addField("Users in Queue: ", "filler")
    .setFooter("Bot created by: curpha", "https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/be/bed810f8bebd7be235b8f7176e3870de1006a6e5_full.jpg");

module.exports = {
    name: 'leave',
    description: 'Leaves the current queue.',
    args: false,
    usage: '',
    guildOnly: true,
    cooldown: 1,
    aliases: ['l'],

    execute(message)
    {
        let user = {discordUser: message.member.user};

        // remove user from queue
        if (inQueue.isUserInQueue(user))
        {
            if (inQueue.users.length !== 6)
            {
                inQueue.remove(user);

                // if there's more than 1 user in the queue
                if (inQueue.users.length > 0)
                {
                    embedMessageLeaveQueue.fields[1].name = "Users in Queue: " + inQueue.users.length;
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
            }
            else
            {
                message.reply("You cannot leave as you are in a game!")
            }
        }
    },
};