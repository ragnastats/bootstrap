if(typeof ragnarok !== "undefined")
{
    ragnarok.window =
    {
        compiled: {},
        callback: false,
        loaded: 0,
        count: 0,
        
        load: function(template, data)
        {
            ragnarok.window.count++;
            
            var template = '../templates/'+template+'.html';
            
            $.get(template, function(response)
            {
                var compiled = Hogan.compile(response);
                var rendered = compiled.render(data);
                
                ragnarok.window.compiled[template] = compiled;
                $('body').append(rendered);
                
                ragnarok.window.loaded++;
                
                if(ragnarok.window.count == ragnarok.window.loaded && typeof ragnarok.window.callback == "function")
                    ragnarok.window.callback();
            });
        },

        ready: function(callback)
        {
            if(typeof callback == "function")
            {
                ragnarok.window.callback = callback;
                
                if(ragnarok.window.count == ragnarok.window.loaded)
                {
                    ragnarok.window.callback();
                }
            }
        },

        update: function(template, data)
        {
            
        },
        
        minimize: function()
        {
            // Hide window content
            // Swap content if necessary
        },
        
        close: function()
        {
            // Style the window invisible
        }
    }    
}
