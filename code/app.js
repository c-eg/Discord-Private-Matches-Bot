/**
 * File          : app.js
 * Last Modified : 14/09/2020
 * Description   : Discord bot for private 6 person matches
 * Author        : c-eg - Conor Egan
 */

/**
 * todo:
 *  - !setpeak command should store the users peak mmr in db
 *  - !help should list all commands
 *  - Add commands for admins/mods to clear queue etc.
 *
 */

// requires
const Discord = require("discord.js");
const config = require("./config.json");

const client = new Discord.Client();

// set to store users in queue
let users = new Set();

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

const embedMessageLeaveQueue = new Discord.MessageEmbed()
    .setTitle('Private Matches!')
    .setColor("#b10000")
    .addField("User Left the Queue", "filler")
    .addField("Users in Queue: ", "filler");

const embedMessageQueueFull = new Discord.MessageEmbed()
    .setTitle('Private Matches!')
    .setColor("#b10000")
    .addField("Queue Full, Players in Queue: ", "filler")
    .addField("Vote Method", "filler");

const embedMessageMatchStarted = new Discord.MessageEmbed()
    .setTitle('Private Matches!')
    .setColor("#b10000")
    .addField("Team 1", "filler")
    .addField("Team 2", "filler");

client.on("message", function(message)
{
    // if bot or message doesn't start with prefix, do nothing
    if (message.author.bot)
        return;
    else if (!message.content.startsWith(config.PREFIX))
        return;
    else
    {
        // message contents
        const args = message.content.slice(config.PREFIX.length).split(" ");
        const command = args.shift().toLowerCase();

        // joining queue
        if (command === "q" || command === "queue")
        {
            // add user to set to keep track of who wants to play
            users.add(message.member.user);

            // user starts the queue
            if (users.size === 1)
            {
                embedMessageStartedQueue.fields[0].value = message.member.user.toString() + " started the queue, type `!q` or `!queue` to join!"

                // send the message
                client.channels.cache.get(message.channel.id).send(embedMessageStartedQueue);
            }
            // user joins the queue
            else if (users.size > 1 && users.size < 6)
            {
                // set EmbedMessage to the string
                embedMessageJoinedQueue.fields[0].value = message.member.user.toString() + " joined the queue.";
                embedMessageJoinedQueue.fields[1].name = "Users in Queue: " + users.size;
                embedMessageJoinedQueue.fields[1].value = getUsersInQueue();

                // send the message
                client.channels.cache.get(message.channel.id).send(embedMessageJoinedQueue);
            }
            // queue is full, vote on method to start match
            else if (users.size === 6)
            {
                // update users in queue
                embedMessageQueueFull.fields[0].name = "Queue Full, Players in Queue: 6";
                embedMessageQueueFull.fields[0].value = getUsersInQueue();

                //
            }
        }
        else if (command === "l" || command === "leave")
        {
            users.delete(message.member.user);

            // if there's more than 1 user in the queue
            if (users.size > 0)
            {
                embedMessageLeaveQueue.fields[1].name = "Users in Queue: " + users.size;
                embedMessageLeaveQueue.fields[1].value = getUsersInQueue();
            }
            else
            {
                embedMessageLeaveQueue.fields[1].name = "Queue Empty";
                embedMessageLeaveQueue.fields[1].value = "No users in the queue.";
            }

            // set EmbedMessage to the string
            embedMessageLeaveQueue.fields[0].value = message.member.user.toString() + " left the queue.";

            // send the message
            client.channels.cache.get(message.channel.id).send(embedMessageLeaveQueue);
        }
        else if (command === "setpeak")
        {
            if (args.length === 1)
            {
                //client.channels.cache.get(message.channel.id).send("your mmr is: " + args[0]);

                // set users mmr in db
            }
            else
            {
                // reply to user saying they should enter the command like: !setpeak <mmr>
            }
        }
    }
})

client.login(config.BOT_TOKEN);

function getUsersInQueue()
{
    let inQueue = "";

    for (const item of users.values())
        inQueue += item.toString() + ' ';

    return inQueue;
}