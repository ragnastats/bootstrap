/***************************************
 *
 * UI specific / jQuery stuff
 *
 */

// Add UI functions to main ragnarok object
ragnarok.ui = {    
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
            var weight = 0;
            
            // Function to build inventory HTML from ragnarok.inventory.items
            $.each(ragnarok.inventory.items, function(index, inventory)
            {
                var item = ragnarok.items[inventory.item];

                if(typeof item.type != "undefined" && item.type.indexOf(type) != -1)
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

                    ragnarok.panes[pane].getContentPane().append(html);
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
            var filler = 100 - ragnarok.inventory.items.length;

            if(filler > 0)
            {
                for(var i = 0; i < filler; i++)
                {
                    ragnarok.panes[pane].getContentPane().append("<div class='ro-item'></div>");
                }
            }

            // Set character weight
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

                if(typeof item.type != "undefined" && item.type.indexOf(type) != -1)
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
            var filler = 100 - ragnarok.storage.items.length;

            if(filler > 0)
            {
                for(var i = 0; i < filler; i++)
                {
                    $(selector).append("<div class='ro-item-wrap'><div class='ro-item'></div></div>");
                }
            }

            parent.find('.ro-win-foot p').text(ragnarok.storage.items.length + "/600");
            ragnarok.ui.panefix(pane);
        },

        character: function(selector)
        {
            console.log('populate that character~', ragnarok.character);
            $(selector).find('.ro-handle').attr('ro-min-text', "<span>"+ragnarok.character.name+"</span>");
            $(selector).find('.ro-name').text(ragnarok.character.name);
            $(selector).find('.ro-class').text(ragnarok.character.class);
            $(selector).find('.ro-zeny').text("Zeny : "+number_format(ragnarok.character.zeny));

            var hp_percent = Math.round((ragnarok.character.hp.current / ragnarok.character.hp.total) * 100) +"%";
            $(selector).find('.ro-hp').find('.ragnarok-progress-bar-total').text(hp_percent);
            $(selector).find('.ro-hp').find('.ragnarok-progress-bar, .ragnarok-progress-bar-red').find('div').css({'width': hp_percent});
            $(selector).find('.ro-hp').find('.ragnarok-progress-bar, .ragnarok-progress-bar-red').find('span').text(ragnarok.character.hp.current + " / " + ragnarok.character.hp.total);
            
            var sp_percent = Math.round((ragnarok.character.sp.current / ragnarok.character.sp.total) * 100) +"%";
            $(selector).find('.ro-sp').find('.ragnarok-progress-bar-total').text(sp_percent);
            $(selector).find('.ro-sp').find('.ragnarok-progress-bar, .ragnarok-progress-bar-red').find('div').css({'width': sp_percent});;
            $(selector).find('.ro-sp').find('.ragnarok-progress-bar, .ragnarok-progress-bar-red').find('span').text(ragnarok.character.sp.current + " / " + ragnarok.character.sp.total);

            $(selector).find('.ro-lvl').text("Base Lv. "+ragnarok.character.level.base);
            $(selector).find('.ro-job-lvl').text("Job Lv. "+ragnarok.character.level.job);

            var exp_percent = ((ragnarok.character.exp.base.current / ragnarok.character.exp.base.total) * 100).toFixed(1) +"%";
            $(selector).find('.ro-exp').attr('hover', exp_percent);
            $(selector).find('.ro-exp').find('div').css({'width': exp_percent});
            
            var job_exp_percent = ((ragnarok.character.exp.job.current / ragnarok.character.exp.job.total) * 100).toFixed(1) +"%";
            $(selector).find('.ro-job-exp').attr('hover', job_exp_percent);
            $(selector).find('.ro-job-exp').find('div').css({'width': job_exp_percent});

            var weight_percent = Math.round((ragnarok.character.weight.current / ragnarok.character.weight.total) * 100) +"%";
            $(selector).find('.ro-weight').attr('hover', "Weight " + weight_percent);
            $(selector).find('.ro-weight').text('Weight : ' + ragnarok.character.weight.current + " / " + ragnarok.character.weight.total);
        }
    },

    load: function(url)
    {
        // Load all character information from a single file
        $.getJSON(url, function(response)
        {
            ragnarok.inventory.items = response.inventory;
            ragnarok.storage.items = response.storage;
            ragnarok.character = response.character;

            $('.ragnarok-tab-inventory, .ro-tab-inv').eq(0).trigger('click');
            $('.ragnarok-tab-storage, .ro-tab-stor').eq(0).trigger('click');
            ragnarok.ui.populate.character('.basic-info');
        });
    },

    panefix: function(pane)
    {
        // Determine footer height and resize scroll pane accordingly
        var parent = ragnarok.panes[pane].getContentPane().parents('.ragnarok-window, .ro-win');
        var height = parent.height();

        var offset = 24;

        if(parent.find('.ragnarok-window-footer, .ro-win-foot'))
            offset += parent.find('.ragnarok-window-footer, .ro-win-foot').outerHeight(true);

        ragnarok.panes[pane].getContentPane().parents('.jspContainer').css({'height': height - offset});
        ragnarok.panes[pane].reinitialise();

        // Subtract 8 pixels from the scrollbar to account for the arrows
        var scrollbar = ragnarok.panes[pane].getContentPane().parents('.ragnarok-window, .ro-win').find('.jspDrag');    
        scrollbar.height(scrollbar.height() - 8);
        
        $('.jspTrack, .jspArrow').addClass('ro-btn');
    },

    set_weight: function()
    {
        var weight = 0;
        
        // Terrible!
        $.each(ragnarok.inventory.items, function(index, inventory)
        {
            var item = ragnarok.items[inventory.item];

            if(typeof item.type != "undefined" && typeof item.weight != "undefined")
            {
                // Increase total weight
                weight += parseFloat(item.weight) * parseFloat(inventory.quantity);
            }
        });
                
        var weight_percent = Math.round((weight / ragnarok.character.weight.total) * 100);

        if(weight_percent >= 50)
            $('.basic-info').find('.ro-weight').addClass('overweight');
        else
            $('.basic-info').find('.ro-weight').removeClass('overweight');
        
        $('.basic-info').find('.ro-weight').attr('hover', "Weight " + weight_percent+"%");
        $('.basic-info').find('.ro-weight').text('Weight : ' + weight + " / " + ragnarok.character.weight.total);
    }
};

$(document).ready(function()
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
    
    ragnarok.api.populate(['items'], 'http://api.ragnastats.com/items.json', function()
    {
        ragnarok.api.populate(['character'], '../demo/character-api-example.json', function()
        {
            ragnarok.ui.populate.character('.basic-info');

            ragnarok.api.populate(['inventory','items'], '../demo/inventory-api-example.json', function()
            {
                // Populate inventory window after API request completes
                //ragnarok.ui.populate.inventory('.inventory .ro-items', 'usable');
                $('.ragnarok-tab-inventory, .ro-tab-inv').eq(0).trigger('click');
            });

            ragnarok.api.populate(['storage','items'], '../demo/storage-api-example.json', function()
            {
                // Populate storage window after API request completes
                //ragnarok.ui.populate.storage('.storage .ro-items', 'usable');
                $('.ragnarok-tab-storage, .ro-tab-stor').eq(0).trigger('click');
            });
        });
    });

    $('body').on('click', '.ragnarok-load, .ro-load', function()
    {
        ragnarok.ui.load($(this).attr('href'));
    });

    $('body').on('click', '.ragnarok-tab-inventory, .ro-tab-inv', function()
    {
        $(this).siblings().removeClass('active');
        $(this).addClass('active');

        $('.ragnarok-tab-inventory-background, .ro-tab-inv-bg').css({"background-image": "url("+$(this).attr('img')+")"});

        ragnarok.ui.clear.inventory('.inventory .ro-items');
        ragnarok.ui.populate.inventory('.inventory .ro-items', $(this).attr('tab'));
    });

    $('body').on('click', '.ragnarok-tab-storage, .ro-tab-stor', function()
    {
        $(this).siblings().removeClass('active');
        $(this).addClass('active');

        $('.ragnarok-tab-storage-background, .ro-tab-stor-bg').css({"background-image": "url("+$(this).attr('img')+")"});

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
        if($(this).find('.ragnarok-sidebar, .ro-side').length)
        {
            var sidebar = {
                width: $(this).find('.ragnarok-sidebar, .ro-side').outerWidth(true),
                height: $(this).find('.ragnarok-sidebar, .ro-side div').outerHeight(true),
            };

            var footer = {
                height: $(this).find('.ragnarok-window-footer, .ro-win-foot').outerHeight(true)
            };

           $(this).find('.ragnarok-window-content, .ro-win-content').css({'padding-left': sidebar.width + 4, 'min-height': sidebar.height - footer.height});
        }

        if($(this).find('.ragnarok-window-footer, .ro-win-foot').length)
        {
           var footerHeight = $(this).find('.ragnarok-window-footer, .ro-win-foot').outerHeight(true);
           $(this).find('.ragnarok-window-content, .ro-win-content').css({'padding-bottom': footerHeight + 4});
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
        if($(this).find('.ragnarok-window-title-blue, .ro-win-title-b').length)
        {
            $(this).css({'height': $(this).height(), 'width': $(this).width()});
            
            $(this).find('.ragnarok-window-content, .ro-win-content').css({
                'position': 'absolute',
                'top': $(this).find('.ragnarok-window-title-blue, .ro-win-title-b').outerHeight(true),
                'bottom': '0px',
                'left': '0px',
                'right': '0px'
            });
            
            $(this).drag({target: ['ragnarok-window-title-blue', 'ro-win-title-b', 'ragnarok-handle', 'ro-handle']});
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
        $(this).parents('.ragnarok-window, .ro-win').remove();
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
        
        hover.css({'left': offset.left, 'top': offset.top - (hover.outerHeight(true) - $(this).outerHeight(true) * 0.2) });
        handle.css({'left': offset.left, 'top': offset.top, 'width': $(this).outerWidth(true), 'height': $(this).outerHeight(true)});

        // Make sure the hover box doesn't go outside the window
        if(offset.left + hover.outerWidth(true) > $(window).width())
        {
            var overflow = offset.left + hover.outerWidth(true) - $(window).width() 
            hover.css({'left': offset.left - overflow});
        }
    });

    $('body').on('mouseleave', '.ro-hover-handle', function(event)
    {
        $('.ro-hover-box').remove();
        $('.ro-hover-handle').remove();
    });

    $('body').on('mousedown', '.ro-hover-handle', function(event)
    {
        // Pass click event to the actual element being clicked on
        $('.ro-hovering').trigger('mousedown', event);
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
            var previous = $('.ragnarok-item-collection').attr('item');
            var item = $(this).find('img').attr('item');

            // Remove previous item windows
            $('.ragnarok-item-collection').remove();
            
            if(item != previous)
            {
                var wrap = $('<div class="ragnarok-window ragnarok-item-collection">'),
                    popup = $('<div class="ragnarok-window-inner">'),
                    image = $('<img src="http://cdn.ragnastats.com/collection/'+item+'.png">'),
                    title = $('<div class="ragnarok-title ro-handle">'+ragnarok.items[item].name+'</div>'),
                    content = $('<div class="ro-scroll-pane ragnarok-content">');

                popup.append(title);
                popup.append(image);
                content.html(ragnarok.items[item].desc);
                popup.append(content);
                
                wrap.attr('item', item);
                wrap.append(popup);
                $('body').append(wrap);

                wrap.drag({target: ['ragnarok-window', 'ro-win', 'ragnarok-window-inner', 'ro-win-in', 'ragnarok-handle', 'ro-handle']});

                wrap.css({
                    position: 'absolute',
                    top: $(window).height() / 2 - popup.height() / 2,
                    left: $(window).width() / 2  - popup.width() / 2
                });
            }
        }
    });
});
