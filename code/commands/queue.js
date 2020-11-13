/**
 * File          : queue.js
 * Last Modified : 24/09/2020
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
    .addField("A queue has started!", "filler")
    .setFooter("Bot created by: curpha", "https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/be/bed810f8bebd7be235b8f7176e3870de1006a6e5_full.jpg");

const embedMessageJoinedQueue = new Discord.MessageEmbed()
    .setTitle('Private Matches!')
    .setColor("#b10000")
    .addField("User Joined!", "filler")
    .addField("Users in Queue: ", "filler")
    .setFooter("Bot created by: curpha", "https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/be/bed810f8bebd7be235b8f7176e3870de1006a6e5_full.jpg");

const embedMessageCaptains = new Discord.MessageEmbed()
    .setTitle("Captains Selected!")
    .setColor("#b10000")
    .addField("Team 1 Captain", "filler")
    .addField("Team 2 Captain", "filler")
    .setFooter("Bot created by: curpha", "https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/be/bed810f8bebd7be235b8f7176e3870de1006a6e5_full.jpg");

const embedMessageTeams = new Discord.MessageEmbed()
    .setTitle("Match Created!")
    .setColor("#b10000")
    .addField("Team 1", "filler")
    .addField("Team 2", "filler")
    .setFooter("Bot created by: curpha", "https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/be/bed810f8bebd7be235b8f7176e3870de1006a6e5_full.jpg");

module.exports = {
    name: 'queue',
    description: 'Queues you for a private 6 person match.',
    args: false,
    usage: '',
    guildOnly: true,
    cooldown: 1,
    aliases: ['q'],

    execute(message)
    {
        let messageUser = message.member.user;

        if (inQueue.users.length !== 6)
        {
            getUser(messageUser.id, function(response)
            {
                // user not in db
                if (!response)
                {
                    message.reply(`You have not set your peak MMR, use: \`!setpeak [mmr]\`, e.g. \`!setpeak 1000\``);
                    return;
                }
                else
                {
                    let User = {discordUser: messageUser, mmr: response.MMR};

                    if (inQueue.isUserInQueue(User))
                    {
                        message.reply("you are already in the queue.");
                        return;
                    }
                    else
                    {
                        // add user to set to keep track of who wants to play
                        inQueue.add(User);
                    }

                    // user starts the queue
                    if (inQueue.users.length === 1)
                    {
                        embedMessageStartedQueue.fields[0].value = messageUser.toString() + " started the queue, type `!q` or `!queue` to join!"

                        // send the message
                        message.channel.send(embedMessageStartedQueue);
                    }
                    // user joins the queue
                    else if (inQueue.users.length > 1 && inQueue.users.length < 6)
                    {
                        // set EmbedMessage to the string
                        embedMessageJoinedQueue.fields[0].value = messageUser.toString() + " joined the queue.";
                        embedMessageJoinedQueue.fields[1].name = "Users in Queue: " + inQueue.users.length;
                        embedMessageJoinedQueue.fields[1].value = inQueue.getUsersInQueue();

                        // send the message
                        message.channel.send(embedMessageJoinedQueue);
                    }
                    // queue is full, vote on method to start match
                    else if (inQueue.users.length === 6)
                    {
                        message.channel.send(inQueue.getUsersInQueue())
                            .then(() =>
                            {
                                message.channel.send(`Please vote on the team balancing method! (2 minutes to vote)\n\nType:  \`!b\`  for balanced teams\nType:  \`!c\`  for team captains\nType:  \`!r\`  for random teams\n`)
                                    .then(() =>
                                    {
                                        /*
                                         *  Start vote
                                         */
                                        let voteBalanced = 0;
                                        let voteCaptains = 0;
                                        let voteRandom = 0;
                                        let usersVoting = [];

                                        for (let i = 0; i < inQueue.users.length; i++)
                                        {
                                            usersVoting.push(inQueue.users[i]);
                                        }

                                        const conditions = ['!b', '!c', '!r'];

                                        // user is in queue and message is either: 'b', 'c' or 'r'
                                        const filter = m => conditions.some(element => m.content === element.toString());

                                        const collector = message.channel.createMessageCollector(filter, { time: 120000 });

                                        collector.on('collect', m =>
                                        {
											if (usersVoting.some(user => user.discordUser.id === m.author.id))
											{										
												switch (m.content)
												{
													case '!b':
														voteBalanced++;
														break;
													case '!c':
														voteCaptains++;
														break;
													case '!r':
														voteRandom++;
														break;
												}

												// remove user from voting
												usersVoting = usersVoting.filter((el) =>
												{
													return el.discordUser.id !== m.author.id;
												});

												if (voteBalanced >= 3 || voteCaptains >= 3 || voteRandom >= 3)
												{
													collector.stop();
												}
												else if (voteBalanced === 2 && voteCaptains === 2 && voteRandom === 2)
												{
													collector.stop();
												}
											}											
                                        });

                                        collector.on('end', () =>
                                        {
                                            if ((voteBalanced >= 3) || voteBalanced === 2 && voteCaptains === 2 && voteRandom === 2)
                                                balancedMethod(message);
                                            else if (voteCaptains >= 3)
                                                captainsMethod(message);
                                            else if (voteRandom >= 3)
                                                randomMethod(message);
                                            else
                                            {
                                                inQueue.clear();
                                                message.channel.send("Queue cancelled because not enough people voted!");
                                            }
                                        });
                                    });
                            });
                    }
                }
            });
        }
        else
        {
            message.reply("Please wait until the vote is finished.");
            return;
        }
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

    message.channel.send(embedMessageTeams)
        .then(() =>
        {
            inQueue.clear();
        });
}

function captainsMethod(messageFirst)
{
    let teamOne = [];
    let teamTwo = [];
    let notInTeam = [];

    inQueue.users.sort(compareMMR);

    teamOne.push(inQueue.users[0].discordUser);
    teamTwo.push(inQueue.users[1].discordUser);

    // send message so users know captains are selecting teams
    embedMessageCaptains.fields[0].value = teamOne[0].toString();
    embedMessageCaptains.fields[1].value = teamTwo[0].toString();

    messageFirst.channel.send(embedMessageCaptains);

    const captainVotePickMessage = "Please pick a player to be on your team, type the number corresponding to the player e.g. `2`\n";
    let messageToSend = captainVotePickMessage;

    for (let i = 2; i < inQueue.users.length; i++)
    {
        notInTeam.push(inQueue.users[i]);
        messageToSend += i - 1 + ") " + inQueue.users[i].discordUser.toString() + "\n";
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

    firstPick.send(messageToSend)
        .then((message) =>
        {
            const filter = m => 1 === 1;

            // get first picks choice 1
            message.channel.awaitMessages(filter, { max: 1 })
                .then((collected) =>
                {
                    let index;

                    for (let i = 1; i < 5; i++)
                    {
                        if (collected.first().content === i.toString())
                        {
                            index = i;
                            break;
                        }
                    }

                    if (firstPick === teamOne[0])
                        teamOne.push(notInTeam.splice(index - 1, 1)[0].discordUser);
                    else
                        teamTwo.push(notInTeam.splice(index - 1, 1)[0].discordUser);
                })
                .then(() =>
                {
                    let messageToSend = captainVotePickMessage;

                    for (let i = 0; i < notInTeam.length; i++)
                    {
                        messageToSend += i + 1 + ") " + notInTeam[i].discordUser.toString() + "\n";
                    }

                    secondPick.send(messageToSend)
                        .then((message) =>
                        {
                            // get second picks choice 1
                            message.channel.awaitMessages(filter, { max: 1 })
                                .then((collected) =>
                                {
                                    let index;

                                    for (let i = 1; i < 4; i++)
                                    {
                                        if (collected.first().content === i.toString())
                                        {
                                            index = i;
                                            break;
                                        }
                                    }

                                    if (secondPick === teamOne[0])
                                        teamOne.push(notInTeam.splice(index - 1, 1)[0].discordUser);
                                    else
                                        teamTwo.push(notInTeam.splice(index - 1, 1)[0].discordUser);
                                })
                                .then(() =>
                                {
                                    let messageToSend = captainVotePickMessage;

                                    for (let i = 0; i < notInTeam.length; i++)
                                    {
                                        messageToSend += i + 1 + ") " + notInTeam[i].discordUser.toString() + "\n";
                                    }

                                    secondPick.send(messageToSend)
                                        .then((message) =>
                                        {
                                            // get first picks choice 2
                                            message.channel.awaitMessages(filter, { max: 1 })
                                                .then((collected) =>
                                                {
                                                    let index;

                                                    for (let i = 1; i < 3; i++)
                                                    {
                                                        if (collected.first().content === i.toString())
                                                        {
                                                            index = i;
                                                            break;
                                                        }
                                                    }

                                                    if (secondPick === teamOne[0])
                                                    {
                                                        teamOne.push(notInTeam.splice(index - 1, 1)[0].discordUser);
                                                        teamTwo.push(notInTeam.shift().discordUser);
                                                    }
                                                    else
                                                    {
                                                        teamTwo.push(notInTeam.splice(index - 1, 1)[0].discordUser);
                                                        teamOne.push(notInTeam.shift().discordUser);
                                                    }
                                                })
                                                .then(() =>
                                                {
                                                    embedMessageTeams.fields[0].value = teamOne.join(' ');
                                                    embedMessageTeams.fields[1].value = teamTwo.join(' ');

                                                    messageFirst.channel.send(embedMessageTeams)
                                                    .then(() =>
                                                    {
                                                        inQueue.clear();
                                                    });
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

    message.channel.send(embedMessageTeams)
        .then(() =>
        {
            inQueue.clear();
        });
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