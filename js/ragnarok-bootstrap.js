$(document).ready(function()
{
    // Auto-correct the content's margin based on sidebar and footer
    $('.ragnarok-window, .ro-win').each(function()
    {
        if($(this).find('.ragnarok-sidebar, .ro-side').length)
        {
            var sidebar = {
                width: $(this).find('.ragnarok-sidebar, .ro-side').outerWidth(true),
                height: $(this).find('.ragnarok-sidebar, .ro-side div').outerHeight(true),
            };

            console.log(sidebar);

           $(this).find('.ragnarok-window-content, .ro-win-content').css({'padding-left': sidebar.width + 4, 'min-height': sidebar.height});
        }

        if($(this).find('.ragnarok-window-footer, .ro-win-foot').length)
        {
           var footerHeight = $(this).find('.ragnarok-window-footer, .ro-win-foot').outerHeight(true);
           $(this).find('.ragnarok-window-content, .ro-win-content').css({'padding-bottom': footerHeight + 4});
        }
    });

    $('.ragnarok-scroll-pane, .ro-scroll-pane').jScrollPane({showArrows: true, hideFocus: true});
    $('.jspDrag').height($('.jspDrag').height() - 8);
});
