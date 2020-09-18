/**
 * File          : setpeak.js
 * Last Modified : 18/09/2020
 * Description   : Command to set peak mmr in database
 * Author        : c-eg (Conor Egan)
 */

module.exports = {
    name: 'setpeak',
    description: 'Sets your peak mmr for 3s to balance teams.',
    args: true,
    usage: '[mmr]',
    guildOnly: true,
    cooldown: 30,

    execute(message, args)
    {
        message.channel.send(`your mmr is: ${args[0]}`);

        // database stuff needs doing
    },
};