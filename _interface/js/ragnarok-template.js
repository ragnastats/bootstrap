/*
 * This file defines all functions required to load and update hogan templates
 */

if(typeof ragnarok !== "undefined")
{
    ragnarok.template =
    {
        template_path: '/bootstrap/_interface/templates/',
        compiled: {},
        callback: false,
        loaded: 0,
        count: 0,

        // This function preloads a template and saves the compiled response
        preload: function(template)
        {
            // If this template hasn't been requested yet
            if(typeof ragnarok.template.compiled[template] == "undefined")
            {
                ragnarok.template.count++;
                var template_url = ragnarok.template.template_path+template+'.html';
                
                $.get(template_url, function(response)
                {
                    ragnarok.template.loaded++;
                    var compiled = Hogan.compile(response);
                    ragnarok.template.compiled[template] = compiled;

                    if(ragnarok.template.count == ragnarok.template.loaded && typeof ragnarok.template.callback == "function")
                        ragnarok.template.callback();
                });
            }
        },

        // This function loads a template and appends the rendered response to the page
        load: function(template, data)
        {
            ragnarok.template.count++;
                        
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

                if(Modernizr.localstorage)
                {
                    if(typeof localStorage['template_'+template] != "undefined")
                    {
                        var metadata = JSON.parse(localStorage['template_'+template])
                        $rendered.css({height: metadata.height, width: metadata.width, top: metadata.position.top, left: metadata.position.left});
                    }                    
                }
                
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

        // Save metadata (like size and position) for this template to localstorage
        save: function(template)
        {
            if(Modernizr.localstorage)
            {
                var $template = $('#'+template);
                var metadata = {
                    height: $template.height(),
                    width: $template.width(),
                    position: $template.position()
                };
                
                localStorage['template_'+template] = JSON.stringify(metadata);
            }
        },

        update: function(template, data)
        {
            // Make sure this template has already been compiled before trying to update it
            if(!ragnarok.template.compiled[template]) return;
            
            var existing = document.getElementById(template);
            var rendered = ragnarok.template.compiled[template].render(data);
            var $rendered = $(rendered);
            
            // Replace the scrollpane and update it
            if($rendered.find('.ragnarok-scroll-pane, .ro-scroll-pane').length)
            {
                $existing = $(existing);
                var rendered_pane = $rendered.find('.ragnarok-scroll-pane, .ro-scroll-pane').html();                
                var pane = $existing.find('.ragnarok-scroll-pane, .ro-scroll-pane');
                var pane_id = pane.attr('ro-pane-id');
                
                ragnarok.panes[pane_id].getContentPane().html(rendered_pane);
                ragnarok.ui.panefix(pane_id);
            }
            else
                existing.innerHTML = $rendered.html();
        },

        clone: function(template, data)
        {
            // We can only clone preloaded templates!
            if(typeof ragnarok.template.compiled[template] != "undefined")
            {
                var compiled = ragnarok.template.compiled[template];

                // Return the rendered result
                return compiled.render(data);
            }
        }
    }
}
