/**
 * File          : queue.js
 * Last Modified : 18/09/2020
 * Description   : Command to join the queue
 * Author        : c-eg (Conor Egan)
 */

module.exports = {
    name: 'queue',
    description: 'Queues you for a private 6 person match.',
    args: false,
    usage: '',
    guildOnly: true,
    cooldown: 2,
    aliases: ['q'],

    execute(message, args)
    {
        // add user to set to keep track of who wants to play
        users.add(message.member.user);

        // user starts the queue
        if (users.size === 1)
        {
            embedMessageStartedQueue.fields[0].value = message.member.user.toString() + " started the queue, type `!q` or `!queue` to join!"

            // send the message
            discordClient.channels.cache.get(message.channel.id).send(embedMessageStartedQueue);
        }
        // user joins the queue
        else if (users.size > 1 && users.size < 6)
        {
            // set EmbedMessage to the string
            embedMessageJoinedQueue.fields[0].value = message.member.user.toString() + " joined the queue.";
            embedMessageJoinedQueue.fields[1].name = "Users in Queue: " + users.size;
            embedMessageJoinedQueue.fields[1].value = getUsersInQueue();

            // send the message
            discordClient.channels.cache.get(message.channel.id).send(embedMessageJoinedQueue);
        }
        // queue is full, vote on method to start match
        else if (users.size === 6)
        {
            // update users in queue
            embedMessageQueueFull.fields[0].name = "Queue Full, Players in Queue: 6";
            embedMessageQueueFull.fields[0].value = getUsersInQueue();

            //
        }
    },
};