// requires
const Discord = require("discord.js");
const config = require("./config.json");

const client = new Discord.Client();


/**
 * todo:
 *  - continue making the leave embedMessage
 *  - work how to link users to:
 *      - steam
 *      - xbox
 *      - ps
 *  - store users in db
 *  - how to get mmr from linked account
 *  - store mmr in db
 *
 */











// set to store users in queue
let users = new Set();

// template for EmbedMessage when a user starts a queue
const embedMessageStartedQueue = new Discord.MessageEmbed()
    .setTitle('Private matches!')
    .setColor("#b10000")
    .addField("A queue has started!", "filler");

const embedMessageJoinedQueue = new Discord.MessageEmbed()
    .setTitle('Private matches!')
    .setColor("#b10000")
    .addField("User Joined!", "filler")
    .addField("Users in Queue: ", "filler");

const embedMessageLeaveQueue = new Discord.MessageEmbed()
    .setTitle('Private matches!')
    .setColor("#b10000")
    .addField("User Left the Queue", "filler")
    .addField("Users in Queue: ", "filler")

// const embedMessageLeaveQueueNoUsersLeft = new Discord.MessageEmbed()
//     .setTitle('Private matches!')
//     .setColor("#b10000")
//     .addField("User Left the Queue", "filler")
//     .addField("Users in Queue: ", "filler")


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

            // print users in queue
            if (users.size > 1)
            {
                let inQueue = "";

                // get users in queue and add to string to add to EmbedMessage
                for (const item of users.values())
                    inQueue += item.toString() + ' ';

                // set EmbedMessage to the string
                embedMessageJoinedQueue.fields[0].value = message.member.user.toString() + " joined the queue.";
                embedMessageJoinedQueue.fields[1].name = "Users in Queue: " + users.size;
                embedMessageJoinedQueue.fields[1].value = inQueue;

                // send the message
                client.channels.cache.get(message.channel.id).send(embedMessageJoinedQueue);
            }
            // say user started queue
            else
            {
                embedMessageStartedQueue.fields[0].value = message.member.user.toString() + " started the queue, type `!q` or `!queue` to join!"

                // send the message
                client.channels.cache.get(message.channel.id).send(embedMessageStartedQueue);
            }
        }
        else if (command === "l" || command === "leave")
        {
            users.delete(message.member.user);

            let inQueue = "";

            // if there's more than 1 user in the queue
            if (users.size > 0)
            {
                for (const item of users.values())
                    inQueue += item.toString() + ' ';
            }
            else
            {
                inQueue = "No users in the queue.";
            }

            // set EmbedMessage to the string
            embedMessage.fields[0].value = inQueue;

            // send the message
            client.channels.cache.get(message.channel.id).send(embedMessage);
        }
    }
})

client.login(config.BOT_TOKEN);