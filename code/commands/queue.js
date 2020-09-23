/**
 * File          : queue.js
 * Last Modified : 21/09/2020
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
    .setTitle('Vote on match balancing method, 2 minutes remaining!')
    .setColor("#b10000")
    .addField("User's not voted:", "filler")
    .addField(":regional_indicator_b: Balanced (based of mmr)", "No votes.")
    .addField(":regional_indicator_c: Captains", "No votes.")
    .addField(":regional_indicator_r: Random (completely random)", "No votes.");

const embedMessageTeams = new Discord.MessageEmbed()
    .setTitle("Match Created!")
    .setColor("#b10000")
    .addField("Team 1", "filler")
    .addField("Team 2", "filler");

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
                let User = {discordUser: message.member.user, mmr: response.MMR};

                if (inQueue.isUserInQueue(User))
                {
                    message.reply("you are already in the queue.");
                    return;
                }

                if (inQueue.users.length !== 6)
                {
                    // add user to set to keep track of who wants to play
                    inQueue.add(User);
                }
                else
                {
                    message.reply("Please wait until the vote is finished.");
                    return;
                }


                // user starts the queue
                if (inQueue.users.length === 1)
                {
                    embedMessageStartedQueue.fields[0].value = message.member.user.toString() + " started the queue, type `!q` or `!queue` to join!"

                    // send the message
                    message.channel.send(embedMessageStartedQueue);
                }
                // user joins the queue
                else if (inQueue.users.length > 1 && inQueue.users.length < 6)
                {
                    // set EmbedMessage to the string
                    embedMessageJoinedQueue.fields[0].value = message.member.user.toString() + " joined the queue.";
                    embedMessageJoinedQueue.fields[1].name = "Users in Queue: " + inQueue.users.length;
                    embedMessageJoinedQueue.fields[1].value = inQueue.getUsersInQueue();

                    // send the message
                    message.channel.send(embedMessageJoinedQueue);
                }
                // queue is full, vote on method to start match
                else if (inQueue.users.length === 6)
                {
                    // update users in queue
                    embedMessageQueueFull.fields[0].name = "Queue Full, Players in Queue: 6";
                    embedMessageQueueFull.fields[0].value = inQueue.getUsersInQueue();

                    // start vote
                    const filter = (reaction, user) =>
                    {
                        return ['🇧', '🇨', '🇷'].includes(reaction.emoji.name);
                    };

                    let noVote = [];
                    let voteBalanced = [];
                    let voteCaptains = [];
                    let voteRandom = [];
                    let usersVoted = [];

                    // add users in queue to not voted
                    for (let i = 0; i < inQueue.users.length; i++)
                    {
                        noVote.push(inQueue.users[i].discordUser);
                    }

                    embedMessageQueueFull.fields[0].value = noVote.join(' ');

                    // send embed
                    message.channel.send(embedMessageQueueFull)
                        .then((msg) =>
                        {
                            // add reactions to allow users to vote
                            msg.react("🇧")
                                .then(() => msg.react("🇨"))
                                .then(() => msg.react("🇷"))
                                .catch((err) => console.error("Failed to react: " + err))
                                .then(() =>
                                {
                                    const collector = msg.createReactionCollector(filter, { time: 120000 });

                                    const newEmbed = new Discord.MessageEmbed(msg.embeds[0]);

                                    // when user reacts
                                    collector.on('collect', (reaction, user) =>
                                    {
                                        // check user is in queue
                                        if (!inQueue.isUserIdInQueue(user))
                                        {
                                            msg.reactions.resolve(reaction).users.remove(user);
                                        }
                                        else
                                        {
                                            let userVoted = false;

                                            for (let i = 0; i < usersVoted.length; i++)
                                            {
                                                if (usersVoted[i].id === user.id)
                                                    userVoted = true;
                                            }

                                            if (!userVoted)
                                            {
                                                if (reaction.emoji.name === '🇧')
                                                {
                                                    voteBalanced.push(user);
                                                    noVote = removeFromArray(noVote, user);
                                                }
                                                else if (reaction.emoji.name === '🇨')
                                                {
                                                    voteCaptains.push(user);
                                                    noVote = removeFromArray(noVote, user);
                                                }
                                                else if (reaction.emoji.name === '🇷')
                                                {
                                                    voteRandom.push(user);
                                                    noVote = removeFromArray(noVote, user);
                                                }

                                                usersVoted.push(user);

                                                // remove user's reaction to keep it clean
                                                msg.reactions.resolve(reaction).users.remove(user);

                                                // change content of who voted
                                                if (noVote.length > 0)
                                                    newEmbed.fields[0].value = noVote.join(' ');
                                                else
                                                    newEmbed.fields[0].value = "No users.";

                                                if (voteBalanced.length > 0)
                                                    newEmbed.fields[1].value = voteBalanced.join(' ');
                                                else
                                                    newEmbed.fields[1].value = "No votes.";

                                                if (voteCaptains.length > 0)
                                                    newEmbed.fields[2].value = voteCaptains.join(' ');
                                                else
                                                    newEmbed.fields[2].value = "No votes.";

                                                if (voteRandom.length > 0)
                                                    newEmbed.fields[3].value = voteRandom.join(' ');
                                                else
                                                    newEmbed.fields[3].value = "No votes.";

                                                msg.edit(newEmbed);

                                                // if users 3 users vote for the same method
                                                if (voteBalanced.length === 2 || voteCaptains.length === 2 || voteRandom.length === 2) // CHANGE CUNT
                                                {
                                                    collector.stop();
                                                }
                                                // if the votes are split
                                                else if (voteBalanced.length === 2 && voteCaptains.length === 2 && voteRandom.length === 2)
                                                {
                                                    collector.stop();
                                                }
                                            }
                                        }
                                    });

                                    collector.on('end', collected =>
                                    {
                                        msg.reactions.removeAll();

                                        if (voteBalanced.length === 2 || (voteBalanced.length === 2 && voteCaptains.length === 2 && voteRandom.length === 2))
                                        {
                                            balancedMethod(message);
                                        }
                                        else if (voteCaptains.length === 2)
                                        {
                                            captainsMethod(message);
                                        }
                                        else if (voteRandom.length === 2)
                                        {
                                            randomMethod(message);
                                        }
                                        else
                                        {
                                            message.channel.send("2 mintues passed without enough votes, queue cancelled.");
                                        }
                                    })
                                });
                        });
                }
            }
        });
    },
};

function balancedMethod(message)
{
    let teamOne = [];
    let teamTwo = [];

    // sort by mmr
    inQueue.users.sort(compareMMR);

    // add users 1, 4, 5 to team 1
    teamOne.push(inQueue.users[0].discordUser, inQueue.users[3].discordUser, inQueue.users[4].discordUser);

    // add users 2, 3, 6 to team 2
    teamTwo.push(inQueue.users[1].discordUser, inQueue.users[2].discordUser, inQueue.users[5].discordUser);

    embedMessageTeams.fields[0].value = teamOne.join(' ');
    embedMessageTeams.fields[1].value = teamTwo.join(' ');

    message.channel.send(embedMessageTeams);
    inQueue.clear();
}

function captainsMethod(messageFirst)
{
    let teamOne = [];
    let teamTwo = [];
    let notInTeam = [];

    inQueue.users.sort(compareMMR);

    teamOne.push(inQueue.users[0].discordUser);
    teamTwo.push(inQueue.users[1].discordUser);

    let msg = "Please pick a player to be on your team, type the number corresponding to the player e.g. `2`\n";

    for (let i = 2; i < inQueue.users.length; i++)
    {
        notInTeam.push(inQueue.users[i]);
        msg += i - 1 + ") " + inQueue.users[i].discordUser.toString() + "\n";
    }

    let firstPick;
    let secondPick;

    if (teamOne[0].mmr > teamTwo[0].mmr)
    {
        firstPick = teamTwo[0];
        secondPick = teamOne[0];
    }
    else
    {
        firstPick = teamOne[0];
        secondPick = teamTwo[0];
    }

    firstPick.send(msg)
        .then((message) =>
        {
            const filter = m => 1 === 1;

            // get first picks choice 1
            message.channel.awaitMessages(filter, { max: 1 })
                .then((collected) =>
                {
                    let i;

                    if (collected.first().content === '1')
                    {
                        i = 1;
                    }
                    else if (collected.first().content === '2')
                    {
                        i = 2;
                    }
                    else if (collected.first().content === '3')
                    {
                        i = 3;
                    }
                    else if (collected.first().content === '4')
                    {
                        i = 4;
                    }

                    if (firstPick === teamOne[0])
                        teamOne.push(notInTeam.splice(i - 1, 1)[0].discordUser);
                    else
                        teamTwo.push(notInTeam.splice(i - 1, 1)[0].discordUser);
                })
                .then(() =>
                {
                    let a = "Please pick a player to be on your team, type the number corresponding to the player e.g. `2`\n";

                    for (let i = 0; i < notInTeam.length; i++)
                    {
                        a += i + 1 + ") " + notInTeam[i].discordUser.toString() + "\n";
                    }

                    secondPick.send(a)
                        .then((message) =>
                        {
                            // get second picks choice 1
                            message.channel.awaitMessages(filter, { max: 1 })
                                .then((collected) =>
                                {
                                    let i;

                                    if (collected.first().content === '1')
                                    {
                                        i = 1;
                                    }
                                    else if (collected.first().content === '2')
                                    {
                                        i = 2;
                                    }
                                    else if (collected.first().content === '3')
                                    {
                                        i = 3;
                                    }

                                    if (secondPick === teamOne[0])
                                        teamOne.push(notInTeam.splice(i - 1, 1)[0].discordUser);
                                    else
                                        teamTwo.push(notInTeam.splice(i - 1, 1)[0].discordUser);
                                })
                                .then(() =>
                                {
                                    let a = "Please pick a player to be on your team, type the number corresponding to the player e.g. `2`\n";

                                    for (let i = 0; i < notInTeam.length; i++)
                                    {
                                        a += i + 1 + ") " + notInTeam[i].discordUser.toString() + "\n";
                                    }

                                    firstPick.send(a)
                                        .then((message) =>
                                        {
                                            // get first picks choice 2
                                            message.channel.awaitMessages(filter, { max: 1 })
                                                .then((collected) =>
                                                {
                                                    let i;

                                                    if (collected.first().content === '1')
                                                    {
                                                        i = 1;
                                                    }
                                                    else if (collected.first().content === '2')
                                                    {
                                                        i = 2;
                                                    }

                                                    if (firstPick === teamOne[0])
                                                    {
                                                        teamOne.push(notInTeam.splice(i - 1, 1)[0].discordUser);
                                                        teamTwo.push(notInTeam.shift().discordUser);
                                                    }
                                                    else
                                                    {
                                                        teamTwo.push(notInTeam.splice(i - 1, 1)[0].discordUser);
                                                        teamOne.push(notInTeam.shift().discordUser);
                                                    }
                                                })
                                                .then(() =>
                                                {
                                                    embedMessageTeams.fields[0].value = teamOne.join(' ');
                                                    embedMessageTeams.fields[1].value = teamTwo.join(' ');

                                                    messageFirst.channel.send(embedMessageTeams);
                                                    inQueue.clear();
                                                });
                                        });
                                });
                        });
                });
        });
}

function randomMethod(message)
{
    let teamOne = [];
    let teamTwo = [];

    shuffle(inQueue.users);

    // add users 1, 2, 3 to team 1
    teamOne.push(inQueue.users[0].discordUser, inQueue.users[1].discordUser, inQueue.users[2].discordUser);

    // add users 4, 5, 6 to team 2
    teamTwo.push(inQueue.users[3].discordUser, inQueue.users[4].discordUser, inQueue.users[5].discordUser);

    embedMessageTeams.fields[0].value = teamOne.join(' ');
    embedMessageTeams.fields[1].value = teamTwo.join(' ');

    message.channel.send(embedMessageTeams);
    inQueue.clear();
}

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
 * function to sort array based on mmr
 * highest mmr is first, lowest mmr is last
 */
function compareMMR(userA, userB)
{
    if (userA.mmr > userB.mmr)
        return -1;
    else if (userA.mmr < userB.mmr)
        return 1;
    else
        return 0;
}

function removeFromArray(array, user)
{
    array = array.filter((element) =>
    {
        return element !== user;
    });

    return array;
}

function shuffle(array)
{
    let currentIndex = array.length, temporaryValue, randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }

    return array;
}