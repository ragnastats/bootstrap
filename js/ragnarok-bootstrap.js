/***************************************
 *
 * Data structures and API functions!
 *
 */


var ragnarok = (function()
{
    var api = {
        populate: {
            inventory: function(url, callback) {
                $.getJSON(url, function(response)
                {
                    ragnarok.inventory.items = response;

                    if(typeof callback == "function")
                        callback();
                });
            },
            
            items: function(url, callback) {
                $.getJSON(url, function(response)
                {
                    ragnarok.items = response;

                    if(typeof callback == "function")
                        callback();
                });
            },

            storage: function(url, callback) {
                $.getJSON(url, function(response)
                {
                    ragnarok.storage.items = response;

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

        add: function(item, quantity)
        {

        },

        remove: function(item, quantity)
        {

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

        add: function(item, quantity)
        {

        },

        remove: function(item, quantity)
        {

        }
    };
    
    return {
        api: api,
        character: character,
        inventory: inventory,
        storage: storage
    };
})();
