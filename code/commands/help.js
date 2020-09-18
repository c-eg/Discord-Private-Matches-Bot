/**
 * File          : help.js
 * Last Modified : 18/09/2020
 * Description   : Command to help the user with all commands the bot has
 * Author        : c-eg (Conor Egan)
 */

module.exports = {
    name: 'help',
    description: 'Lists all commands and describes how to use them.',
    args: false,
    usage: '',
    guildOnly: false,
    cooldown: 30,

    execute(message, args)
    {
        message.channel.send('help');
    },
};