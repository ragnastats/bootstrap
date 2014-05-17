/***************************************
 *
 * Data structures and API functions!
 *
 */


var ragnarok = (function()
{
    var api = {
        populate: function(reference, url, callback) {
            if(typeof reference == "object" && reference.length)
            {
                $.getJSON(url, function(response)
                {
                    // There has to be a better way to do this...
                    if(reference.length == 1)
                    {
                        ragnarok[reference[0]] = response;
                    }

                    else if(reference.length == 2)
                    {
                        ragnarok[reference[0]][reference[1]] = response;
                    }

                    if(typeof callback == "function")
                        callback();
                });
            }
        }
    };
    
    // Information about your character
    var character = {};

    // Functions for a character's personal inventory 
    var inventory = {
        // Array contaning all inventory items
        items: [],

        index: function(item)
        {
            var item_count = inventory.items.length;
            
            for(var i = 0; i < item_count; i++)
            {
                if(inventory.items[i].item == item)
                    return i;
            }

            return -1;
        },

        add: function(item, quantity)
        {
            var index = inventory.index(item);

            // Make sure quantity is a number!
            quantity = parseInt(quantity);

            if(index < 0)
            {
                // If the item wasn't found, add it to the inventory!
                inventory.items.push({item: item, quantity: quantity});
            }
            else
            {
                // If the item was found, increase the quantity!
                inventory.items[index].quantity = parseInt(inventory.items[index].quantity) + quantity;
            }

            return true;
        },

        quantity: function(item)
        {
            var index = inventory.index(item);

            if(index >= 0)
            {
                return parseInt(inventory.items[index].quantity);
            }

            return false;
        },

        remove: function(item, quantity)
        {
            var index = inventory.index(item);

            // Make sure quantity is a number!
            quantity = parseInt(quantity);

            if(index >= 0)
            {
                // You can only remove an item that exists!
                inventory.items[index].quantity = parseInt(inventory.items[index].quantity) - quantity;

                // Get rid of empty items
                if(inventory.items[index].quantity <= 0)
                    inventory.items.remove(index);

                return true;
            }

            return false;
        },

        // Use a consumable item, or equip some equipment
        use: function(item)
        {

        }
    };

    // Item lookup table
    var items = {};

    // Functions for a character's storage
    var storage = {
        // Array containing all stored items
        items: [],

        index: function(item)
        {
            var item_count = storage.items.length;
            
            for(var i = 0; i < item_count; i++)
            {
                if(storage.items[i].item == item)
                    return i;
            }

            return -1;
        },

        add: function(item, quantity)
        {
            var index = storage.index(item);

            // Make sure quantity is a number!
            quantity = parseInt(quantity);

            if(index < 0)
            {
                storage.items.push({item: item, quantity: quantity});
            }
            else
            {
                storage.items[index].quantity = parseInt(storage.items[index].quantity) + quantity;
            }

            return true;
        },

        quantity: function(item)
        {
            var index = storage.index(item);

            if(index >= 0)
            {
                return storage.items[index].quantity;
            }

            return false;
        },

        remove: function(item, quantity)
        {
            var index = storage.index(item);

            // Make sure quantity is a number!
            quantity = parseInt(quantity);

            if(index >= 0)
            {
                storage.items[index].quantity = parseInt(storage.items[index].quantity) - quantity;

                // Get rid of empty items
                if(storage.items[index].quantity <= 0)
                    storage.items.remove(index);

                return true;
            }

            return false;
        }
    };
    
    return {
        api: api,
        character: character,
        inventory: inventory,
        storage: storage
    };
})();
