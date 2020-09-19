/**
 * File          : InQueue.js
 * Last Modified : 19/09/2020
 * Description   : Module to store users in queue, so other modules/files can
 *                 also access and modify when needed
 * Author        : c-eg (Conor Egan)
 */

let InQueue = module.exports =
    {
        users: new Set(),
        add: function (user)
        {
            InQueue.users.add(user);
        },
        remove: function (user)
        {
            InQueue.users.delete(user);
        },
        clear: function ()
        {
            InQueue.users.clear();
        },
        getUsersInQueue: function ()
        {
            let inQueue = "";

            for (const item of this.users.values())
                inQueue += item.toString() + ' ';

            return inQueue;
        }
    }