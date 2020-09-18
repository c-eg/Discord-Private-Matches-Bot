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
            InQueue.clear();
        },
        getUsersInQueue: function ()
        {
            let inQueue = "";

            for (const item of this.users.values())
                inQueue += item.toString() + ' ';

            return inQueue;
        }
    }