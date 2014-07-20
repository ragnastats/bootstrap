if(typeof ragnarok !== "undefined")
{
    ragnarok.minimap =
    {
        name: '',
        max: {height: 126, width: 126},
        size: {},
        
        init: function(map)
        {            
            // Clear previous icons
            ragnarok.minimap.clear();
            var $map = $('.ro-minimap img');
            
            ragnarok.minimap.name = map.name;
            ragnarok.minimap.size = {height: map.height, width: map.width};
            ragnarok.minimap.resize(map);
            
            var map_image = "http://cdn.ragnastats.com/map/"+map.name+".png";
            $map.attr('src', map_image);
        },
        
        resize: function(map)
        {
            var $map = $('.ro-minimap img');
            var adjusted = {};
            
            // Use whichever side is bigger
            if(map.height > map.width)
            {
                adjusted.height = ragnarok.minimap.max.height;
                adjusted.width = (adjusted.height * map.width) / map.height;
            }
            else
            {
                adjusted.width = ragnarok.minimap.max.width;
                adjusted.height = (adjusted.width * map.height) / map.width;
            }
            
            $map.css({'height': adjusted.height, 'width': adjusted.width, 'opacity': 1});
        },
        
        add: function(pos)
        {
            var square = $(document.createElement('div'));
            square.addClass('square');
            
            // Get native map size
            var native_size = ragnarok.minimap.size;

            // Get current map size
            var current_size = {height: $('.ro-minimap').height(), width: $('.ro-minimap').width()};
                        
            // Position icon accordingly
            var icon_pos = 
            {
                x: (current_size.width / native_size.width) * pos.x,
                y: (current_size.height / native_size.height) * pos.y
            }
  
            square.css({bottom: icon_pos.y - 2, left: icon_pos.x - 2});
            $('.ro-minimap').append(square);
        },
        
        clear: function()
        {
            $('.ro-minimap .square').remove();
        }
    }
}
