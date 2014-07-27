/*
 * This file defines all functions required to load and update hogan templates
 */

if(typeof ragnarok !== "undefined")
{
    ragnarok.template =
    {
        template_path: '../templates/',
        compiled: {},
        callback: false,
        loaded: 0,
        count: 0,
        
        load: function(template, data)
        {
            ragnarok.template.count++;
            
            window.location
            
            var template_url = ragnarok.template.template_path+template+'.html';
            
            $.get(template_url, function(response)
            {
                var compiled = Hogan.compile(response);
                var rendered = compiled.render(data);
                var $rendered = $(rendered);
                $rendered.eq(0).attr('id', template);
                
                ragnarok.template.compiled[template] = compiled;
                $('body').append($rendered);
                
                ragnarok.template.loaded++;
                
                if(ragnarok.template.count == ragnarok.template.loaded && typeof ragnarok.template.callback == "function")
                    ragnarok.template.callback();
            });
        },

        ready: function(callback)
        {
            if(typeof callback == "function")
            {
                ragnarok.template.callback = callback;
                
                if(ragnarok.template.count == ragnarok.template.loaded)
                {
                    ragnarok.template.callback();
                }
            }
        },

        update: function(template, data)
        {
            var existing = document.getElementById(template);
            var rendered = ragnarok.template.compiled[template].render(data);
            var $rendered = $(rendered);
            
            // Replace the scrollpane and update it
            if($rendered.find('.ragnarok-scroll-pane, .ro-scroll-pane').length)
            {
                $existing = $(existing);
                var rendered_pane = $rendered.find('.ragnarok-scroll-pane, .ro-scroll-pane').html();                
                var pane = $existing.find('.ragnarok-scroll-pane, .ro-scroll-pane').attr('ro-pane-id');
                
                ragnarok.panes[pane].getContentPane().html(rendered_pane);
                ragnarok.ui.panefix(pane);
            }
            // Simple replacement
            else
                existing.innerHTML = $rendered.html();            
        }
    }
}
