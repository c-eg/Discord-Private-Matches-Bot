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
    usage: '<mmr>',
    guildOnly: true,
    cooldown: 30,

    execute(message, args)
    {
        /**
         * Change this as you don't need to check for args length anymore.
         */
        if (args.length === 1)
        {
            //client.channels.cache.get(message.channel.id).send("your mmr is: " + args[0]);

            // set users mmr in db
        }
        else
        {
            // reply to user saying they should enter the command like: !setpeak <mmr>
        }
    },
};