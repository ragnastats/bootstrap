if(typeof ragnarok !== "undefined")
{
    ragnarok.window =
    {
        compiled: {},
        
        create: function(template, data)
        {
            $.get(template, function(response)
            {
                var compiled = Hogan.compile(response);
                var rendered = compiled.render(data);
                
                ragnarok.window.compiled[template] = compiled;
                $('body').append(rendered);
            });
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
    
    ragnarok.window.create('../windows/test.html', {'test-title': "Hello World!", 'test-content': "Templating systems sure are fun ^_~"});
}
