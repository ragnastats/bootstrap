if(typeof ragnarok == "undefined") ragnarok = {};

ragnarok.map = {
    background: '.ro-map-bg',
    foreground: '.ro-map-fg',
    scale: 32,
    speed: 150, // Default character speed
    ready: false,

    calc_distance: function(a, b)
    {
        return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
    },

    // Initialize the map with your character
    init: function(name, position)
    {
        $(ragnarok.map.background).prepend("<div class='ro-map-char me' data-x='"+position.x+"' data-y='"+position.y+"' data-top='0' data-left='0'><div class='relative'><div class='name'>"+name+"</div></div></div>");

        // Center yourself
        var top = $(ragnarok.map.background).height() / 2 - $('.ro-map-char.me').outerHeight(true) / 2;
        var left = $(ragnarok.map.background).width() / 2 - $('.ro-map-char.me').outerWidth(true) / 2;
        
        $('.ro-map-char.me').css({
            transform: 'translate('+left+'px, '+top+'px)'
        });

        ragnarok.map.ready = true;
    },
    
    // Set your current position on the map (when going through portals / teleporting)
    position: function(position)
    {
        if(!ragnarok.map.ready) return;
        
        // Clear old characters
        ragnarok.map.character.clear();
        
        var $my = $('.ro-map-char.me');
        var my = $my[0].dataset;

        // Set saved attributes to new values
        my.x = position.x;
        my.y = position.y;

        // Reset background position
        my.top = 0;
        my.left = 0;

        $(ragnarok.map.background).css({
            transition: 'none',
            transform: 'translate(0px, 0px)'
        });
    },

    // Move to a new location on the map
    move: function(position)
    {
        if(!ragnarok.map.ready) return;

        var $my = $('.ro-map-char.me');
        var my = $my[0].dataset;
        
        var difference = {
            x: my.x - position.x,
            y: my.y - position.y
        };

        difference.top = difference.y * ragnarok.map.scale;
        difference.left = difference.x * ragnarok.map.scale;

        if(typeof my.top == "undefined") my.top = 0;
        if(typeof my.left == "undefined") my.left = 0;
        
        my.top = parseInt(my.top) - difference.top;
        my.left = parseInt(my.left) + difference.left;

        var distance = ragnarok.map.calc_distance(my, position);
        var time = (distance * ragnarok.map.speed) / 1000;

        $(ragnarok.map.foreground).css({
            transition: 'transform '+time+'s',
            transform: 'translate('+my.left+'px, '+my.top+'px)'
        });

        my.x = position.x;
        my.y = position.y;
    },

    // Functions for handling the positions of other characters
    character: {
        // Add a new character to the map
        add: function(id, name, type, position)
        {
            if(!ragnarok.map.ready) return;

            var $my = $('.ro-map-char.me');
            var my = $my[0].dataset;
            
            // Determine the center point of the screen
            var center = {
                top: $(ragnarok.map.foreground).height() / 2 - parseInt(my.top),
                left: $(ragnarok.map.foreground).width() / 2 - parseInt(my.left)
            };

            $(ragnarok.map.foreground).prepend("<div class='ro-map-char "+type+"' id='"+id+"' data-x='"+position.x+"' data-y='"+position.y+"'><div class='relative'><div class='name'>"+name+"</div></div></div>");

            var $character = $('#'+id);
            var character = $character[0].dataset;
             
            var difference = {
                x: my.x - position.x,
                y: my.y - position.y
            };

            difference.top = difference.y * ragnarok.map.scale;
            difference.left = difference.x * ragnarok.map.scale;

            if(typeof character.top == "undefined") character.top = 0;
            if(typeof character.left == "undefined") character.left = 0;

            character.top = parseInt(center.top) + difference.top - ($character.outerHeight(true) / 2);
            character.left = parseInt(center.left) - difference.left - ($character.outerWidth(true) / 2);

            $character.css({transform: 'translate('+character.left+'px, '+character.top+'px)'});
        },

        // Move a character
        move: function(id, position)
        {
            if(!ragnarok.map.ready) return;

            var $character = $('#'+id);
            var character = $character[0].dataset;
            
            var difference = {
                x: character.x - position.x,
                y: character.y - position.y
            };

            difference.top = difference.y * ragnarok.map.scale;
            difference.left = difference.x * ragnarok.map.scale;

            if(typeof character.top == "undefined") character.top = 0;
            if(typeof character.left == "undefined") character.left = 0;
            
            character.top = parseInt(character.top) + difference.top;
            character.left = parseInt(character.left) - difference.left;

            var distance = ragnarok.map.calc_distance(character, position);
            var time = (distance * ragnarok.map.speed) / 1000;

            $character.css({
                transition: 'transform '+time+'s',
                transform: 'translate('+character.left+'px, '+character.top+'px)'
            });

            character.x = position.x;
            character.y = position.y;
        },

        // Remove a character
        remove: function(id)
        {
            $('#'+id).remove();
        },

        // Clear all characters
        clear: function()
        {
            $(ragnarok.map.foreground).find('.ro-map-char').remove();
        }
    }
};
