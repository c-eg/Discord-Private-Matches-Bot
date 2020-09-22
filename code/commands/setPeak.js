/**
 * File          : setPeak.js
 * Last Modified : 21/09/2020
 * Description   : Command to set peak mmr in database
 * Author        : c-eg (Conor Egan)
 */

const sqlite3 = require('sqlite3').verbose();       // get sqlite3

module.exports = {
    name: 'setpeak',
    description: 'Sets your peak mmr for 3s to balance teams.',
    args: true,
    argsLength: 1,
    usage: '[mmr]',
    guildOnly: true,
    cooldown: 0,

    execute(message, args)
    {
        let okay = true;

        // loop through each char in the argument passes as mmr
        for (let i = 0; i < args[0].length; i++)
        {
            // check the char is a number
            if ((args[0].charCodeAt(i) > 47) && (args[0].charCodeAt(i) < 58))
                continue;
            else
            {
                okay = false;
                break;
            }
        }

        // error checking
        if (args[0].length > 4)
            message.reply("Please enter an mmr of 4 characters maximum!");
        else if (!okay)
            message.reply("Please enter a number!");
        else
        {
            // get user from db
            getUser(message.member.user.id, function(response)
            {
                // user in db
                if (response != null)
                {
                    // update the user's mmr in the db
                    updateUser(message.member.user.id, args[0], function(response)
                    {
                        message.reply(`MMR was updated to: ${response}`);
                    });
                }
                // user not in db
                else
                {
                    // create user in db
                    createUser(message.member.user.id, args[0], function(response)
                    {
                        message.reply(`MMR was set to: ${response}`)
                    });
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

/**
 * function to create user in the db
 * @param discordID user's discord id
 * @param mmr user's mmr
 * @param callback function to call once query is complete
 */
function createUser(discordID, mmr, callback)
{
    let db = new sqlite3.Database("data/users.db", sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE);

    // run insert statement
    db.run('INSERT INTO Users(DiscordID, MMR) VALUES(?, ?)', [discordID, mmr], function(err)
    {
        if (err)
        {
            callback(err);
        }

        callback(mmr);
    });

    db.close(() =>
    {
        console.log("db closed createUser.")
    });
}

/**
 * function to update user in the db
 * @param discordID user's discord id
 * @param mmr user's mmr
 * @param callback function to call once query is complete
 */
function updateUser(discordID, mmr, callback)
{
    let db = new sqlite3.Database("data/users.db", sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE);

    db.run('UPDATE Users SET MMR = ? WHERE DiscordID = ?; ', [mmr, discordID], function(err)
    {
        if (err)
        {
            callback(err);
        }

        callback(mmr);
    });

    db.close(() =>
    {
        console.log("db closed updateUser.")
    });
}