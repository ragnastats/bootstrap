/*
 * This file is used for all functions specific to Ragnarok windows
 */

if(typeof ragnarok !== "undefined")
{
    ragnarok.window =
    {
        open: function(template)
        {
            $template = $('#'+template);
            $template.show();
        },
        
        minimize: function(template)
        {
            // Hide window content
            // Swap content if necessary
        },
        
        close: function(template)
        {
            $template = $('#'+template);
            // Style the window invisible
            $template.hide();
        }
    }    
}
