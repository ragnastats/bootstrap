/***************************************
 *
 * UI specific / jQuery stuff
 *
 */

// Add UI functions to main ragnarok object
ragnarok.ui = {
    root_path: '/bootstrap/_interface/',
    
    clear: {
        inventory: function(selector) {
            $(selector).find('.ro-item').remove();
        },

        storage: function(selector) {
            $(selector).find('.ro-item-wrap').remove();
        }
    },

    event: {
        item_obtained: function(item, quantity)
        {
            // Remove previous popups
            $('.ragnarok-item-popup').remove();

            if(typeof ragnarok.items[item] == "undefined") return;
            
            // Fallback to ragnastats CDN if item image is unspecified
            if(typeof ragnarok.items[item].icon == "undefined")
                ragnarok.items[item].icon = 'http://cdn.ragnastats.com/item/'+item+'.png';
            
            // Show item popup
            var wrap = $('<div class="ragnarok-window ragnarok-item-popup">');
            var popup = $('<div class="ragnarok-window-inner">');
            var image = $('<img src="'+ragnarok.items[item].icon+'">');

            popup.html(ragnarok.items[item].name + " - "+quantity+" obtained.");
            popup.prepend(image);

            wrap.append(popup);
            $('body').append(wrap);

            wrap.css({
                position: 'absolute',
                top: 50,
                left: $(window).width() / 2  - popup.width() / 2 // PEMDAS YO
            });

            setTimeout(function()
            {
                wrap.remove();
            }, 5000);
        },

        select_quantity: function(item, quantity, from, to)
        {
            if(quantity == 1)
            {
                ragnarok.ui.event.update_quantity(item, quantity, from, to);
                return;
            }
            
            var wrap = $('<div class="ragnarok-window ragnarok-quantity-popup">'),
                popup = $('<div class="ragnarok-window-inner">'),
                button = $('<div class="ro-btn ro-text-btn">OK</div>'),
                input = $('<div class="quantity" contenteditable="true">');
                
            popup.html(ragnarok.items[item].name);
            popup.append(button);

            input.text(quantity);
            popup.append(input);
            
            wrap.append(popup);
            $('body').append(wrap);

            wrap.drag({target: ['ragnarok-window', 'ro-win', 'ragnarok-window-inner', 'ro-win-in', 'ragnarok-handle', 'ro-handle']});

            wrap.css({
                position: 'absolute',
                top: $(window).height() / 2 - popup.height() / 2,
                left: $(window).width() / 2  - popup.width() / 2
            });

            ragnarok.ui.highlight($('body').find(input)[0]);
            $('body').find(input).trigger('focus');
            $('body').find(input).on('keydown', function(event)
            {
                if(event.which == 13)
                {
                    $('body').find(button).trigger('click');
                }
            });

            $('body').find(button).on('click', function(event)
            {
                var value = parseInt($('body').find(input).text());

                if(isNaN(value))
                    value = 0;
                    
                // Ensure you don't spawn extra items~
                if(quantity < value)
                    value = quantity;

                if(value) {
                    ragnarok.ui.event.update_quantity(item, value, from, to);
                }
                
                $('.ragnarok-quantity-popup').remove();
            });
        },

        update_quantity: function(item, quantity, from, to)
        {
            if(typeof from != "undefined")
                ragnarok[from].remove(item, quantity);

            if(typeof to  != "undefined")
                ragnarok[to].add(item, quantity);

            if(to == "inventory")
                ragnarok.ui.event.item_obtained(item, quantity);

            ragnarok.ui.clear.storage('.storage .ro-items');
            ragnarok.ui.populate.storage('.storage .ro-items', $('.ragnarok-tab-storage.active, .ro-tab-stor.active').attr('tab'));

            ragnarok.ui.clear.inventory('.inventory .ro-items');
            ragnarok.ui.populate.inventory('.inventory .ro-items', $('.ragnarok-tab-inventory.active, .ro-tab-inv.active').attr('tab'));
        }
    },

    highlight: function(element)
    {
        var range = document.createRange();
        range.selectNodeContents(element);
        var selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
    },

    position:
    {
        item:
        {
            icon: function(html)
            {
                var width = html.find("img").width(),
                    height = html.find("img").height();

                html.find("img").css({left: (24 - width) / 2, top: (24 - height) / 2}).removeClass('ro-loading');
            },

            quantity: function(html)
            {
                var position = html.find("span").position(),
                    width = html.find("span").width(),
                    container = (html.find('.ro-item').length) ? html.find('.ro-item').width() : html.width();

                var difference = container - (position.left + width);

                if(difference < 0)
                {
                    html.find("span").css({left: position.left + difference});
                }
            }
        }
    },
    
    populate: {
        inventory: function(selector, type) {
            var pane = $(selector).attr('ro-pane-id');
            var height = $(selector).parents('.ragnarok-window, .ro-win').height();
            
            // Function to build inventory HTML from ragnarok.inventory.items
            $.each(ragnarok.inventory.items, function(index, inventory)
            {
                var item = ragnarok.items[inventory.item];

                if(item !== undefined && 
                    typeof item.type != "undefined" && 
                    item.type.indexOf(type) != -1 && 
                    !inventory.equipped)
                {
                    // Fallback to ragnastats CDN if item image is unspecified
                    if(typeof item.icon == "undefined")
                        item.icon = 'http://cdn.ragnastats.com/item/'+inventory.item+'.png';

                    var slots = (item.slots) ? ' ['+item.slots+'] ' : '';
   
                    var html = $("<div class='ro-item ro-hover'>"), 
                        hover = [item.name, slots, ': ', inventory.quantity, ' ea.'].join(""),
                        icon = $("<div><img src='"+ item.icon +"'></div>"),
                        quantity = $("<span>"+ inventory.quantity +"</span>");


                    // Display error when an item's weight is unknown
                    if(typeof item.weight == "undefined")
                        html.addClass('ro-error');

                    icon.find('img').attr('item', inventory.item);
                    html.attr('hover', hover);
                    html.append(icon).append(quantity);

                    var content = ragnarok.panes[pane].getContentPane();
                    content.append(html);
                    html.drag({from: 'inventory'}, function()
                    {
                        // Remove quantity popups
                        $('.ragnarok-quantity-popup').remove();
                    });

                    // Text position
                    ragnarok.ui.position.item.quantity(html);
                }
            });

            // Filler function!
            for(var i = 0; i < 10; i++)
            {
                ragnarok.panes[pane].getContentPane().append("<div class='ro-item'></div>");
            }

            // Set player weight
            ragnarok.ui.set_weight();
            ragnarok.ui.panefix(pane);
        },

        storage: function(selector, type)
        {
            var pane = $(selector).attr('ro-pane-id');
            var parent = $(selector).parents('.ragnarok-window, .ro-win');
            var height = parent.height();

            // Function to build storage HTML from ragnarok.storage.items
            $.each(ragnarok.storage.items, function(index, storage)
            {
                var item = ragnarok.items[storage.item];

                if(item !== undefined && typeof item.type != "undefined" && item.type.indexOf(type) != -1)
                {
                    // Fallback to ragnastats CDN if item image is unspecified
                    if(typeof item.icon == "undefined")
                        item.icon = 'http://cdn.ragnastats.com/item/'+storage.item+'.png';

                    var slots = (item.slots) ? ' ['+item.slots+'] ' : '';
                    
                    var wrap = $("<div class='ro-item-wrap'>"),
                        html = $("<div class='ro-item ro-hover'>"), 
                        hover = item.name + slots,
                        name = $("<p>"+item.name+slots+"</p>"),
                        icon = $("<div><img src='"+ item.icon +"'></div>"),
                        quantity = $("<span>"+ storage.quantity +"</span>");

                    // Display error when an item's weight is unknown
                    if(typeof item.weight == "undefined")
                        wrap.addClass('ro-error');

                    icon.find('img').attr('item', storage.item);
                    html.attr('hover', hover);
                    html.append(icon).append(quantity);

                    wrap.prepend(name);
                    wrap.append(html);

                    ragnarok.panes[pane].getContentPane().append(wrap);
                    html.drag({from: 'storage'}, function()
                    {
                        // Remove quantity popups
                        $('.ragnarok-quantity-popup').remove();
                    });

                    // Text position
                    ragnarok.ui.position.item.quantity(html);
                }
            });

            // Filler function!
            for(var i = 0; i < 10; i++)
            {
                $(selector).append("<div class='ro-item-wrap'><div class='ro-item'></div></div>");
            }

            parent.find('.ro-win-foot p').text(ragnarok.storage.items.length + "/600");
            ragnarok.ui.panefix(pane);
        },

        player: function()
        {
            var player_data = $.extend({
                hp_percent: Math.round((ragnarok.player.hp.current / ragnarok.player.hp.total) * 100) +"%",
                hp_class: (Math.round((ragnarok.player.hp.current / ragnarok.player.hp.total) * 100) < 25) ? 'ragnarok-progress-bar-red' : 'ragnarok-progress-bar',
                sp_percent: Math.round((ragnarok.player.sp.current / ragnarok.player.sp.total) * 100) +"%",
                sp_class: (Math.round((ragnarok.player.sp.current / ragnarok.player.sp.total) * 100) < 25) ? 'ragnarok-progress-bar-red' : 'ragnarok-progress-bar',
                exp_percent: ((ragnarok.player.exp.base.current / ragnarok.player.exp.base.total) * 100).toFixed(1) +"%",
                job_exp_percent: ((ragnarok.player.exp.job.current / ragnarok.player.exp.job.total) * 100).toFixed(1) +"%",
                weight_percent: Math.round((ragnarok.player.weight.current / ragnarok.player.weight.total) * 100) +"%",
                zeny_text: "Zeny : "+number_format(ragnarok.player.zeny)
            }, ragnarok.player);
            
            ragnarok.template.update('basic-info', player_data);
            ragnarok.ui.populate.map();
            ragnarok.ui.set_weight();
        },
        
        chat: function()
        {
            ragnarok.template.update('chat-bar', ragnarok.data.chat);
        },
        
        map: function()
        {
            if(ragnarok.player.map !== undefined)
            {
                ragnarok.minimap.init(ragnarok.player.map);
                
                if(ragnarok.player.pos !== undefined)
                {
                    ragnarok.minimap.add(ragnarok.player.pos);
                }
            }
        },
        
        equip: function()
        {
            var accessory = 0;

            $.each(ragnarok.inventory.items, function(index, inventory)
            {
                var item = ragnarok.items[inventory.item];

                if(item !== undefined &&
                    inventory.type !== undefined &&
                    inventory.equipped > 0)
                {
                    var slot = ragnarok.lookup.equipment_slots[inventory.type.equip];
                    
                    // TODO: This should be its own function?
                    if(slot == "accessory")
                    {
                        if(accessory == 0)
                            slot = "right-accessory";
                        else
                            slot = "left-accessory";
                            
                        accessory++;
                    }
                    
                    ragnarok.ui.equip(inventory.item, slot);
                }
            });
        }
    },

    load: function(url, callback)
    {
        // Load all player information from a single file
        $.getJSON(url, function(response)
        {
            ragnarok.player = response.player;
            ragnarok.storage.items = response.storage;
            ragnarok.inventory.items = response.inventory;

            // Stay in the current tab when loading data
            if($('.ragnarok-tab-inventory.active, .ro-tab-inv.active').length)
                $('.ragnarok-tab-inventory.active, .ro-tab-inv.active').trigger('click');
            // If no tab is active, click on the first one!
            else
                $('.ragnarok-tab-inventory, .ro-tab-inv').eq(0).trigger('click');

            // Same for storage
            if($('.ragnarok-tab-storage.active, .ro-tab-stor.active').length)
                $('.ragnarok-tab-storage.active, .ro-tab-stor.active').trigger('click');
            // If no tab is active, click on the first one!
            else
                $('.ragnarok-tab-storage, .ro-tab-stor').eq(0).trigger('click');

            ragnarok.ui.populate.player('.basic-info');
            ragnarok.ui.populate.equip();

            if(typeof callback == "function") callback(response);
        });
    },

    panefix: function(pane)
    {
        // Determine footer height and resize scroll pane accordingly
        var content = ragnarok.panes[pane].getContentPane();
        var parent = content.parents('.ragnarok-window, .ro-win, .ro-chat-bar');
        var height = parent.height();

        var offset = 8;
        
        if(parent.find('.ragnarok-title, .ragnarok-window-title, .ro-win-title').length)
            offset += parent.find('.ragnarok-title, .ragnarok-window-title, .ro-win-title').outerHeight(true);


        if(parent.find('.ragnarok-window-footer, .ro-win-foot').length)
            offset += parent.find('.ragnarok-window-footer, .ro-win-foot').outerHeight(true);

        // Only set container height when none is set
        if(content.parents('.jspContainer').height() == 0)
            content.parents('.jspContainer').css({'height': height - offset});
 
        ragnarok.panes[pane].reinitialise();

        // Check if the scrollbar has been fixed
        var scrollbar = parent.find('.jspDrag');
        
        if(scrollbar.height() != scrollbar.attr('data-height'))
        {
            // Subtract 8 pixels from the scrollbar to account for the arrows
            var fixed_height = scrollbar.height() - 8;
            scrollbar.height(fixed_height);
            scrollbar.attr('data-height', fixed_height);
        }
        
        $('.jspTrack, .jspArrow').addClass('ro-btn');
        
        if(parent.hasClass('ro-chat-bar'))
        {
            ragnarok.panes[pane].scrollToBottom();
        }
    },

    set_weight: function()
    {
        var weight_percent = Math.round((ragnarok.player.weight.current / ragnarok.player.weight.total) * 100);

        if(weight_percent >= 50)
            $('.basic-info').find('.ro-weight').addClass('overweight');
        else
            $('.basic-info').find('.ro-weight').removeClass('overweight');
        
        $('.basic-info').find('.ro-weight').attr('hover', "Weight " + weight_percent+"%");
        $('.basic-info').find('.ro-weight').text('Weight : ' + ragnarok.player.weight.current + " / " + ragnarok.player.weight.total);
    },

    equip: function(item_id, slot)
    {
        // Make sure there's nothing in the slot first~
        ragnarok.ui.unequip(slot);
        
        var item = ragnarok.items[item_id],
            icon = $('.equip .ro-item[slot="'+slot+'"]');
        
        var parent = icon.parents('.ro-equip');
     
        if(typeof item.icon == "undefined")
            item.icon = 'http://cdn.ragnastats.com/item/'+item_id+'.png';

        var slots = (item.slots) ? ' ['+item.slots+'] ' : '';

        icon.addClass('ro-hover');

        var hover = [item.name, slots].join(""),
            img = $("<div><img src='"+ item.icon +"'></div>");

        img.find('img').attr('item', item_id);
        img.find('img').attr('slot', icon.attr('slot'));
        icon.attr('hover', hover);
        icon.html(img);
        parent.append("<span>"+item.name+"</span>");
    },

    unequip: function(slot)
    {
        var icon = $('.equip .ro-item[slot="'+slot+'"]');
        var parent = icon.parents('.ro-equip');

        // Remove tooltip
        $('.ro-hover-box').remove();
        $('.ro-hover-handle').remove();
        $('.ro-hovering').removeClass('ro-hovering');

        // Remove image
        icon.html('');
        icon.removeAttr('hover');
        icon.removeClass('ro-hover');
        
        // Remove text
        parent.find('span').remove();
    }
};

$(document).on('initialize', function()
{    
    if(Modernizr.localstorage)
    {
        // Show the disclaimer unless the terms have already been accepted/denied
        if(typeof localStorage['terms-accepted'] === "undefined")
        {
            $('.disclaimer').show();
        }
    }
    else
    {
        $('.disclaimer').show();
    }
    
    $('body').on('click', '.ragnarok-load, .ro-load', function()
    {
        ragnarok.ui.load($(this).attr('href'));
    });

    $('body').on('click', '.ragnarok-tab-inventory, .ro-tab-inv', function()
    {
        $(this).siblings().removeClass('active');
        $(this).addClass('active');

        var new_background = "url(" + window.location.protocol + "//" + window.location.host + ragnarok.ui.root_path + "assets/skin/item-tab-" + $(this).attr('tab') + ".png)";
        var current_background = $('.ragnarok-tab-inventory-background, .ro-tab-inv-bg').css('background-image');

        if(new_background != current_background)
            $('.ragnarok-tab-inventory-background, .ro-tab-inv-bg').css({"background-image": new_background});

        ragnarok.ui.clear.inventory('.inventory .ro-items');
        ragnarok.ui.populate.inventory('.inventory .ro-items', $(this).attr('tab'));
    });

    $('body').on('click', '.ragnarok-tab-storage, .ro-tab-stor', function()
    {
        $(this).siblings().removeClass('active');
        $(this).addClass('active');

        var new_background = "url(" + window.location.protocol + "//" + window.location.host + ragnarok.ui.root_path + "assets/skin/stor-tab-" + $(this).attr('tab') + ".png)";
        var current_background = $('.ragnarok-tab-storage-background, .ro-tab-stor-bg').css('background-image');

        if(new_background != current_background)
            $('.ragnarok-tab-storage-background, .ro-tab-stor-bg').css({"background-image": new_background});

        ragnarok.ui.clear.storage('.storage .ro-items');
        ragnarok.ui.populate.storage('.storage .ro-items', $(this).attr('tab'));
    });

    // Fun droppable stuff
    $('.inventory').drop(function(event)
    {
        var from = $('.ro-item-drag').attr('from'),
            item = $('.ro-item-drag').attr('item');

        if(from == "storage")
        {
            var quantity = ragnarok.storage.quantity(item);
            
            // Ensure the item exists before adding it to the inventory
            if(quantity)
            {
                // Display quantity popup when necessary
                ragnarok.ui.event.select_quantity(item, quantity, 'storage', 'inventory');
            }
        }

        if(from == "equip")
        {
            var slot = $('.ro-item-drag').attr('slot');
            ragnarok.ui.unequip(slot);
        }

        $('.ro-item-drag').remove();
    });

    $('.equip .ro-equip').drop(function(event)
    {
        var from = $('.ro-item-drag').attr('from'),
            item_id = $('.ro-item-drag').attr('item'),
            parent = ($(event.target).is('.ro-equip')) ? $(event.target) : $(event.target).parents('.ro-equip');

        var item = ragnarok.items[item_id],
            icon = parent.find('.ro-item');
         
        if(from == "inventory")
        {
            // TODO: Update this to use ragnarok.ui.equip
            if(typeof item.icon == "undefined")
                item.icon = 'http://cdn.ragnastats.com/item/'+item_id+'.png';

            var slots = (item.slots) ? ' ['+item.slots+'] ' : '';

            icon.addClass('ro-hover');

            var hover = [item.name, slots].join(""),
                img = $("<div><img src='"+ item.icon +"'></div>");

            img.find('img').attr('item', item_id);
            img.find('img').attr('slot', icon.attr('slot'));
            icon.drag({from: 'equip'});
            icon.attr('hover', hover);
            icon.html(img);
            parent.append("<span>"+item.name+"</span>");
        }

        $('.ro-item-drag').remove();
    });

    $('.ro-hotkey').drop(function(event)
    {
        var from = $('.ro-item-drag').attr('from'),
            item_id = $('.ro-item-drag').attr('item'),
            parent = $(event.target);

        var item = ragnarok.items[item_id];

        if(typeof item.icon == "undefined")
            item.icon = 'http://cdn.ragnastats.com/item/'+item_id+'.png';

        var slots = (item.slots) ? ' ['+item.slots+'] ' : '';

        parent.addClass('ro-hover');

        var hover = [item.name, slots].join(""),
            img = $("<img src='"+ item.icon +"'>");

        img.attr('item', item_id);
        parent.drag({from: 'hotkey'});
        parent.attr('hover', hover);
        parent.html(img);

        parent.css({height: 'auto'});

        $('.ro-item-drag').remove();        
    });

    $('.storage').drop(function(event)
    {
        var from = $('.ro-item-drag').attr('from'),
            item = $('.ro-item-drag').attr('item');

        if(from == "inventory")
        {
            var quantity = ragnarok.inventory.quantity(item);
            
            // Ensure the item exists before adding it to the inventory
            if(quantity)
            {
                // Display quantity popup when necessary
                ragnarok.ui.event.select_quantity(item, quantity, 'inventory', 'storage');
            }
        }

        $('.ro-item-drag').remove();
    });

    $('.cover').drop({children: false}, function(event)
    {
        var from = $('.ro-item-drag').attr('from'),
            item = $('.ro-item-drag').attr('item');

        if(from == "inventory")
        {
            var quantity = ragnarok.inventory.quantity(item);
            
            // Ensure the item exists before adding it to the inventory
            if(quantity)
            {
                // Display quantity popup when necessary
                ragnarok.ui.event.select_quantity(item, quantity, 'inventory');
            }
        }

        $('.ro-item-drag').remove();
    });
    
    // Auto-correct the content's margin based on sidebar and footer
    $('.ragnarok-window, .ro-win').each(function()
    {
        var hidden = false;
        
        if($(this).find('.ragnarok-sidebar, .ro-side').length)
        {
            // Check if this window is currently visible
            if(!$(this).is(':visible'))
                hidden = true;
                
            $(this).show();
        
            var sidebar = {
                width: $(this).find('.ragnarok-sidebar, .ro-side').outerWidth(true),
                height: $(this).find('.ragnarok-sidebar, .ro-side div').outerHeight(true),
            };

            var footer = {
                height: $(this).find('.ragnarok-window-footer, .ro-win-foot').outerHeight(true)
            };

           $(this).find('.ragnarok-window-content, .ro-win-content').css({'padding-left': sidebar.width + 4, 'min-height': sidebar.height - footer.height});
           
           // Re-hide windows after calculating heights
           if(hidden)
            $(this).hide();
        }
    });

    ragnarok.panes = [];

    // Initialize scroll panes
    $('.ragnarok-scroll-pane, .ro-scroll-pane').each(function()
    {
        var pane = ragnarok.panes.length;
        $(this).jScrollPane({showArrows: true, hideFocus: true});
        $(this).attr('ro-pane-id', pane);                

        var api = $(this).data('jsp');
        ragnarok.panes.push(api);
        ragnarok.ui.panefix(pane);
    });
    
    $('.ragnarok-checkbox, .ro-check').addClass('ro-btn');

    $('.ragnarok-window, .ro-win').each(function()
    {
        if($(this).find('.ragnarok-window-title, .ro-win-title').length)
        {
            $(this).css({'height': $(this).height(), 'width': $(this).width()});
            
            $(this).find('.ragnarok-window-content, .ro-win-content').css({
                'position': 'absolute',
                'top': $(this).find('.ragnarok-window-title, .ro-win-title').outerHeight(true),
                'bottom': '0px',
                'left': '0px',
                'right': '0px'
            });
            
            $(this).drag({target: ['ragnarok-window-title', 'ro-win-title', 'ragnarok-handle', 'ro-handle']});
        }
        else
        {
            $(this).drag({target: ['ragnarok-window', 'ro-win', 'ragnarok-window-inner', 'ro-win-in', 'ragnarok-handle', 'ro-handle']});
        }
    });

    $('.inventory').resize({
        'handle': '.ragnarok-window-resize, .ro-win-resize',
        'grid': 30,
        'min': { 'height': 120, 'width': 200 },
        'max': { 'height': 300, 'width': 400 }
    });

    $('.storage').resize({
        'handle': '.ragnarok-window-resize, .ro-win-resize',
        'grid': 30,
        'min': { 'height': 260, 'width': 200 },
        'max': { 'height': 400, 'width': 400 }
    });

    $('.equip').resize({
        'handle': '.ragnarok-window-resize, .ro-win-resize',
        'grid': 10,
        'min': { 'height': 100, 'width': 200 },
        'max': { 'height': 200, 'width': 300 }
    });

    $('.todo').resize({
        'handle': '.ragnarok-window-resize, .ro-win-resize',
        'grid': 10,
        'min': { 'height': 100, 'width': 200 },
        'max': { 'height': 800, 'width': 400 }
    });

    $('body').on('mousedown', '.ragnarok-button, .ro-btn', function()
    {
        $(this).addClass('click');
    });

    $('body').on('mouseup', '.ragnarok-button, .ro-btn', function()
    {
        $(this).removeClass('click');
    });

    $('body').on('mousedown', '.ragnarok-checkbox, .ro-check', function()
    {
        $(this).toggleClass('checked');
    });

    $('.disclaimer .ro-text-btn').on('click', function()
    {
        if(Modernizr.localstorage)
        {
            // Save the value of the button so we know the terms have been accepted/denied
            localStorage['terms-accepted'] = $(this).attr('value');
        }        
        
        // Temporary behavior to close terms
        $('.disclaimer').hide();
    });

    $('.storage .ro-text-btn').on('click', function()
    {
        var action = $(this).attr('action');

        switch(action)
        {
            case "close":
                $('.storage').hide();
                
                break;
        }
    });

    $('.ragnarok-window-button-close, .ro-win-btn-close').on('click', function()
    {
        $(this).parents('.ragnarok-window, .ro-win').hide();
    });

    $('.ragnarok-window-button-minimize, .ro-win-btn-min').on('click', function()
    {
        // This is so gross
        var parent = $(this).parents('.ragnarok-window, .ro-win');

        var height = parent.height();
        var previous_height = parent.attr('previous-height');
        
        if(previous_height)
        {
            parent.css({'height': previous_height});
            parent.removeAttr('previous-height');
        }
        else
        {
            parent.attr('previous-height', height);
            parent.css({'height': 'auto'});
        }
        
        parent.toggleClass('ro-min');

        // Especially this part
        parent.find('[ro-min-text]').each(function()
        {
            var text = $(this).html();
            var minimized = $(this).attr('ro-min-text');

            $(this).html(minimized);
            $(this).attr('ro-min-text', text);
        });

        // A little gross here too
        if(parent.hasClass('ro-min'))
        {
            if(parent.find('.ragnarok-window-minimized-content, .ro-win-min-content').length)
            {
                parent.css({'border-bottom-right-radius': '8px', 'border-bottom-left-radius': '8px'});
            }
        }
        
    });

    // Stop dragging when the mouse leaves the browser
    $('body').on('mouseleave', function()
    {
        $('.drag').trigger('mouseup');
    });

    $('body').on('mouseenter', '.ragnarok-hover, .ro-hover', function(event)
    {
        // Prevent hover when window is being dragged
        if($(this).parents('.ragnarok-window, .ro-win').length && $(this).parents('.ragnarok-window, .ro-win').hasClass('drag'))
            return;

        // Remove any previously created hover boxes
        $('.ro-hover-box').remove();
        $('.ro-hover-handle').remove();
        $('.ro-hovering').removeClass('ro-hovering');

        // Add hovering class to current element
        $(this).addClass('ro-hovering');
        
        var offset = $(this).offset();
        var hover = $("<div class='ro-hover-box'>"+$(this).attr('hover')+"</div>");
        var handle = $("<div class='ro-hover-handle'></div>");

        if($(this).parents('.ragnarok-window, .ro-win'))
        {
            var parent_offset = $(this).parents('.ragnarok-window, .ro-win').offset();

            offset = {
                top: offset.top - parent_offset.top,
                left: offset.left - parent_offset.left
            };
            
            $(this).parents('.ragnarok-window, .ro-win').append(hover);
            $(this).parents('.ragnarok-window, .ro-win').append(handle);
        }
        else
        {
            $('body').append(hover);
            $('body').append(handle);
        }
        
        if($(this).parents('.ragnarok-scroll-pane, .ro-scroll-pane').length)
        {
            var pane = $(this).parents('.ragnarok-scroll-pane, .ro-scroll-pane').attr('ro-pane-id');
            
            // We have to bind scroll here since the event doesn't bubble
            handle.on('mousewheel', function(event)
            {
                hover.remove();
                handle.remove();
                ragnarok.panes[pane].scrollByY((event.deltaFactor * event.deltaY) * -1);
            });
        }
        
        hover.css({'left': offset.left, 'top': offset.top - (hover.outerHeight(true) - $(this).outerHeight(true) * 0.2) });
        handle.css({'left': offset.left, 'top': offset.top, 'width': $(this).outerWidth(true), 'height': $(this).outerHeight(true)});

        // Make sure the hover box doesn't go outside the window
        if(offset.left + hover.outerWidth(true) > $(window).width())
        {
            var overflow = offset.left + hover.outerWidth(true) - $(window).width() 
            hover.css({'left': offset.left - overflow});
        }

        if(hover.offset().top < 0)
            hover.css({'top': 0});
    });

    $('body').on('mousemove', function(event)
    {
        if($('.ro-hover-box').length)
        {
            if(!$(event.target).is('.ro-hovering, .ro-hover-handle') && !$(event.target).parents('.ro-hovering').length)
            {
                $('.ro-hover-box, .ro-hover-handle').remove();
            }
        }
    });

    $('body').on('mouseleave', '.ro-hover-handle', function(event)
    {
        $('.ro-hover-box').remove();
        $('.ro-hover-handle').remove();
    });

    $('body').on('mousedown dblclick', '.ro-hover-handle', function(event)
    {
        // Pass click event to the actual element being clicked on
        $('.ro-hovering').trigger(event.type, event);
    });

    // General behaviors when clicking on windows
    $('body').on('click', '.ragnarok-window, .ro-win', function(event)
    {
        // Remove quantity popups
        $('.ragnarok-quantity-popup').remove();
    });

    // Stop right click menu on items
    $('body').on('contextmenu', '.ro-item, .ragnarok-hover-handle, .ro-hover-handle', function(event)
    {
        event.preventDefault();
    });

    $('body').on('mousedown', '.ro-item', function(event, context)
    {
        $.extend(event, context);
        
        // Capture right clicks
        if(event.which == 3)
        {
            var parent = $('.ragnarok-item-collection');
            var previous = parent.attr('item');
            var item = $(this).find('img').attr('item');
            
            if(item == previous)
            {
                $('.ragnarok-item-collection').hide();
                parent.attr('item', '');
            }
            else
            {
                $('.ragnarok-item-collection').show();

                var inner = parent.find('.ragnarok-window-inner'),
                    title = parent.find('.ragnarok-title span'),
                    image = parent.find('img'),
                    content = parent.find('.ragnarok-content');

                var pane = content.attr('ro-pane-id');

                inner.css({height: 94});
                title.text(ragnarok.items[item].name);
                image.attr('src', 'http://cdn.ragnastats.com/collection/'+item+'.png');
                parent.attr('item', item);

                ragnarok.panes[pane].getContentPane().parents('.jspContainer').css({height: 78});
                ragnarok.panes[pane].getContentPane().html(ragnarok.items[item].desc);
                ragnarok.ui.panefix(pane);
                
            }
        }
    });

    $('body').on('dblclick', '.equip .ro-item', function(event)
    {
        var slot = $(this).attr('slot');
        ragnarok.ui.unequip(slot);
    });

    $('.ragnarok-item-collection').drag({target: ['ragnarok-window', 'ro-win', 'ragnarok-window-inner', 'ro-win-in', 'ragnarok-handle', 'ro-handle']});

    $('.ragnarok-item-collection .ragnarok-window-inner').resize({
        'parent': '.ragnarok-item-collection',
        'handle': '.ragnarok-window-resize, .ro-win-resize',
        'grid': 1,
        'min': { 'height': 95, 'width': 250 },
        'max': { 'height': 500, 'width': 250 }
    });
});
