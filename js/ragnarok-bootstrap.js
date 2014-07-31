/**************************11*************
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

            if(index > -1)
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

            if(index > -1)
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
        
        // When an item's equip status changes!
        equip: function(item, status)
        {
            var index = inventory.index(item);

            if(index > -1)
                inventory.items[index].equipped = status;
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

            if(index > -1)
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

            if(index > -1)
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
    
    var lookup = {
        // Types without actions will be handled eventually ^_~
        info_types:
        [
            {type: 'speed'},
            {type: 'base_exp'}, // process: function(value) { ragnarok.character.exp.base.current = value; }},
            {type: 'job_exp'}, // process: function(value) { ragnarok.character.exp.job.current = value; }},
            {type: 'mute'},
            {type: 'hp', process: function(value) { ragnarok.character.hp.current = value; }},
            {type: 'max_hp', process: function(value) { ragnarok.character.hp.total = value; }},
            {type: 'sp', process: function(value) { ragnarok.character.sp.current = value; }},
            {type: 'max_sp', process: function(value) { ragnarok.character.sp.total = value; }},
            {type: 'stat_points'},
            {type: 'hair_color'},
            {type: 'base_level', process: function(value) { ragnarok.character.level.base = value; }},
            {type: 'skill_points'},
            {type: 'str'},
            {type: 'agi'},
            {type: 'vit'},
            {type: 'int'},
            {type: 'dex'},
            {type: 'luk'},
            {type: 'job_level', process: function(value) { ragnarok.character.level.job = value; }},
            {type: 'zeny', process: function(value) { ragnarok.character.zeny = value; }},
            {type: 'gender'},
            {type: 'max_base_exp', process: function(value) { ragnarok.character.exp.base.total = value; }},
            {type: 'max_job_exp', process: function(value) { ragnarok.character.exp.job.total = value; }},
            {type: 'weight', process: function(value) { ragnarok.character.weight.current = value / 10; }},
            {type: 'max_weight', process: function(value) { ragnarok.character.weight.total = value / 10; }}

            /*
             * Commented out for now, may want to restructure this anyway.
             * 
            {type: 'atk'},
            {type: 'atk_bonus'},
            {type: 'max_matk'},
            {type: 'min_matk'},
            {type: 'def'},
            {type: 'def_bonus'},
            {type: 'mdef'},
            {type: 'mdef_bonus'},
            {type: 'hit'},
            {type: 'flee'},
            {type: 'flee_bonus'},
            {type: 'crit'},
            {type: 'aspd'},
            {type: 'mercenary_kills'},
            {type: 'mercenary_faith'}
            */
        ],
        
        equipment_slots:
        {
            1: 'lower-headgear',
            2: 'right-hand',
            4: 'garment',
            16: 'armor',
            32: 'left-hand',
            64: 'shoes',
            136: 'accessory',
            256: 'upper-headgear',
            512: 'mid-headgear',             
        }
    };
    
    return {
        api: api,
        character: character,
        lookup: lookup,
        inventory: inventory,
        storage: storage
    };
})();


// From
// http://stackoverflow.com/questions/500606/javascript-array-delete-elements
// Array Remove - By John Resig (MIT Licensed)
Array.prototype.remove = function(from, to) {
  var rest = this.slice((to || from) + 1 || this.length);
  this.length = from < 0 ? this.length + from : from;
  return this.push.apply(this, rest);
};

// Add a module export so this file can be included in node
if(typeof module != "undefined")
    module.exports = ragnarok;
