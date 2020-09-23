/**
 * File          : InQueue.js
 * Last Modified : 19/09/2020
 * Description   : Module to store users in queue, so other modules/files can
 *                 also access and modify when needed
 * Author        : c-eg (Conor Egan)
 */

let InQueue = module.exports =
    {
        users: [],
        add: function (user)
        {
            this.users.push(user);
        },
        remove: function (user)
        {
            for (let i = 0; i < this.users.length; i++)
            {
                if (this.users[i].discordUser.id === user.discordUser.id)
                    this.users.splice(i, 1);
            }
        },
        clear: function ()
        {
            InQueue.users.length = 0;
        },
        isUserInQueue: function (User)
        {
            for (let i = 0; i < this.users.length; i++)
            {
                if (this.users[i].discordUser.id === User.discordUser.id)
                    return true;
            }

            return false;
        },
        isUserIdInQueue: function (user)
        {
            for (let i = 0; i < this.users.length; i++)
            {
                if (this.users[i].discordUser.id === user.id)
                    return true;
            }

            return false;
        },
        getUsersInQueue: function ()
        {
            let inQueue = "";

            this.users.forEach((item) =>
            {
                inQueue += item.discordUser.toString() + ' ';
            });

            return inQueue;
        }
    };