if(typeof ragnarok !== "undefined")
{
    ragnarok.minimap =
    {
        name: '',
        size: {},
        
        init: function(map)
        {
            // Clear previous icons
            ragnarok.minimap.clear();
            
            ragnarok.minimap.name = map.name;
            ragnarok.minimap.size = {height: map.height, width: map.width};
            
            var map_image = "http://cdn.ragnastats.com/map/"+map.name+".png";
            $('.ro-minimap img').attr('src', map_image);
        },
        
        add: function(pos)
        {
            var square = $(document.createElement('div'));
            square.addClass('square');
            
            // Get native map size
            var native_size = ragnarok.minimap.size;

            // Get current map size
            var current_size = {height: $('.ro-minimap').height(), width: $('.ro-minimap').width()};
            
            // Adjust position accordingly
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
