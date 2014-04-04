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
    $('.jspTrack, .jspArrow').addClass('ro-btn');

    $('.ragnarok-window, .ro-win').each(function()
    {
        if($(this).find('.ragnarok-window-title-blue, .ro-win-title-b').length)
        {
            $(this).drag({target: ['ragnarok-window-title-blue', 'ro-win-title-b', 'ragnarok-handle', 'ro-handle']});
        }
        else
        {
            $(this).drag({target: ['ragnarok-window', 'ro-win', 'ragnarok-window-inner', 'ro-win-in', 'ragnarok-handle', 'ro-handle']});
        }
    });

    $('.ragnarok-button, .ro-btn').on('mousedown', function()
    {
        $(this).addClass('click');
    });

    $('.ragnarok-button, .ro-btn').on('mouseup', function()
    {
        $(this).removeClass('click');
    });

    $('.ragnarok-checkbox, .ro-check').on('click', function()
    {
        $(this).toggleClass('checked');
    });

    $('.ragnarok-window-button-close, .ro-win-btn-close').on('click', function()
    {
        $(this).parents('.ragnarok-window, .ro-win').remove();
    });

    $('.ragnarok-window-button-minimize, .ro-win-btn-min').on('click', function()
    {
        $(this).parents('.ragnarok-window, .ro-win').toggleClass('ro-min');
    });
});
