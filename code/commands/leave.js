/**
 * File          : leave.js
 * Last Modified : 18/09/2020
 * Description   : Command to leave the queue
 * Author        : c-eg (Conor Egan)
 */

module.exports = {
    name: 'leave',
    description: 'Leaves the current queue.',
    args: false,
    usage: '',
    guildOnly: true,
    cooldown: 10,

    execute(message, args)
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
        discordClient.channels.cache.get(message.channel.id).send(embedMessageLeaveQueue);
    },
};