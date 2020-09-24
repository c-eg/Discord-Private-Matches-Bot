/**
 * File          : checkPeak.js
 * Last Modified : 24/09/2020
 * Description   : Command to print users mmr
 * Author        : c-eg (Conor Egan)
 */

const sqlite3 = require('sqlite3').verbose();       // get sqlite3

module.exports = {
    name: 'checkpeak',
    description: 'Lists users in the queue.',
    args: false,
    usage: '[user]',
    guildOnly: true,
    cooldown: 3,
    aliases: ['cp'],

    execute(message, args)
    {
        if (!args.length)
        {
            getUser(message.member.user.id, function(response)
            {
                if (!response)
                {
                    message.reply(`You have not set your peak MMR, use: \`!h setpeak\` for help!`);
                }
                else
                {
                    message.reply(`Your peak MMR is: ${response.MMR}!`);
                }
            });
        }
        else
        {
            getUser(args[0].slice(3, -1), function(response)
            {
                if (!response)
                {
                    message.reply(`${args[0]} has not set their peak MMR.`);
                }
                else
                {
                    message.reply(`${args[0]}'s peak MMR is: ${response.MMR}!`);
                }
            });
        }
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