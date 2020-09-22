/**
 * File          : queue.js
 * Last Modified : 18/09/2020
 * Description   : Command to join the queue
 * Author        : c-eg (Conor Egan)
 */

const Discord = require('discord.js');              // get discord.js
let inQueue = require('../data/InQueue.js');        // get users in queue
const sqlite3 = require('sqlite3').verbose();       // get sqlite3

// template for EmbedMessage when a user starts a queue
const embedMessageStartedQueue = new Discord.MessageEmbed()
    .setTitle('Private Matches!')
    .setColor("#b10000")
    .addField("A queue has started!", "filler");

const embedMessageJoinedQueue = new Discord.MessageEmbed()
    .setTitle('Private Matches!')
    .setColor("#b10000")
    .addField("User Joined!", "filler")
    .addField("Users in Queue: ", "filler");

const embedMessageQueueFull = new Discord.MessageEmbed()
    .setTitle('Private Matches!')
    .setColor("#b10000")
    .addField("Queue Full, Players in Queue: ", "filler")
    .addField("Vote Method", "filler");

module.exports = {
    name: 'queue',
    description: 'Queues you for a private 6 person match.',
    args: false,
    usage: '',
    guildOnly: true,
    cooldown: 0,
    aliases: ['q'],

    execute(message)
    {
        getUser(message.member.user.id, function(response)
        {
            // user not in db
            if (!response)
            {
                message.reply(`You have not set your peak MMR, use: \`!h setpeak\` for help!`);
                return;
            }
            else
            {
                if (inQueue.users.has(message.member.user))
                {
                    message.reply("you are already in the queue.");
                    return;
                }

                // add user to set to keep track of who wants to play
                inQueue.add(message.member.user);

                // user starts the queue
                if (inQueue.users.size === 1)
                {
                    embedMessageStartedQueue.fields[0].value = message.member.user.toString() + " started the queue, type `!q` or `!queue` to join!"

                    // send the message
                    message.channel.send(embedMessageStartedQueue);
                }
                // user joins the queue
                else if (inQueue.users.size > 1 && inQueue.users.size < 6)
                {
                    // set EmbedMessage to the string
                    embedMessageJoinedQueue.fields[0].value = message.member.user.toString() + " joined the queue.";
                    embedMessageJoinedQueue.fields[1].name = "Users in Queue: " + inQueue.users.size;
                    embedMessageJoinedQueue.fields[1].value = inQueue.getUsersInQueue();

                    // send the message
                    message.channel.send(embedMessageJoinedQueue);
                }
                // queue is full, vote on method to start match
                else if (inQueue.users.size === 6)
                {
                    // update users in queue
                    embedMessageQueueFull.fields[0].name = "Queue Full, Players in Queue: 6";
                    embedMessageQueueFull.fields[0].value = inQueue.getUsersInQueue();

                    // TODO:
                    //  - finish this
                }
            }
        });
    },
};

/**
 * function to get the user from the db
 * @param discordID user's discord id
 * @param callback function to call once query is complete
 */
function getUser(discordID, callback)
{
    let db = new sqlite3.Database("data/users.db", sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE);

    // get first row
    db.get('SELECT DiscordID, MMR FROM Users WHERE DiscordID = ?', [discordID], function (err, row)
    {
        if (err)
        {
            callback(err);
        }

        callback(row);
    });

    db.close(() =>
    {
        console.log("db closed getUser.")
    });
}