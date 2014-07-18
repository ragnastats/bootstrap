if(typeof ragnarok !== "undefined")
{
    ragnarok.window =
    {
        template_path: '../templates/',
        compiled: {},
        callback: false,
        loaded: 0,
        count: 0,
        
        load: function(template, data)
        {
            ragnarok.window.count++;
            
            window.location
            
            var template_url = ragnarok.window.template_path+template+'.html';
            
            $.get(template_url, function(response)
            {
                var compiled = Hogan.compile(response);
                var rendered = compiled.render(data);
                var $rendered = $(rendered);
                $rendered.eq(0).attr('id', template);
                
                ragnarok.window.compiled[template] = compiled;
                $('body').append($rendered);
                
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
            var existing = document.getElementById(template);
            var rendered = ragnarok.window.compiled[template].render(data);
            var $rendered = $(rendered);
            
            existing.innerHTML = $rendered.html();            
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
