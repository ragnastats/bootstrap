/***************************************
 *
 * UI specific / jQuery stuff
 *
 */

// Add UI functions to main ragnarok object
ragnarok.ui = {
    inventory: {
        // Function to build inventory HTML from ragnarok.inventory.items
        populate: function()
        {

        },

        // Function to fill remaining space in container with empty item slots
        fill: function()
        {

        }
    }
};

$(document).ready(function()
{
    ragnarok.api.populate.items('../demo/api-example.json');
        
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
    $('.ragnarok-checkbox, .ro-check').addClass('ro-btn');

    $('.ragnarok-window, .ro-win').each(function()
    {
        if($(this).find('.ragnarok-window-title-blue, .ro-win-title-b').length)
        {
            $(this).css({'height': $(this).height(), 'width': $(this).width()});
            
            $(this).find('.ragnarok-window-content, .ro-win-content').css({
                'position': 'absolute',
                'top': $(this).find('.ragnarok-window-title-blue, .ro-win-title-b').outerHeight(true),
                'bottom': '0px',
                'left': '0px',
                'right': '0px'
            });
            
            $(this).drag({target: ['ragnarok-window-title-blue', 'ro-win-title-b', 'ragnarok-handle', 'ro-handle']});
        }
        else
        {
            $(this).drag({target: ['ragnarok-window', 'ro-win', 'ragnarok-window-inner', 'ro-win-in', 'ragnarok-handle', 'ro-handle']});
        }
    });

    $('.inventory').resize({
        'handle': '.ragnarok-window-resize, .ro-win-resize',
        'grid': 33,
        'min': { 'height': 120, 'width': 200 },
        'max': { 'height': 300, 'width': 400 }
    });

    $('.equip').resize({
        'handle': '.ragnarok-window-resize, .ro-win-resize',
        'grid': 10,
        'min': { 'height': 100, 'width': 200 },
        'max': { 'height': 200, 'width': 300 }
    });

    $('.todo').resize({
        'handle': '.ragnarok-window-resize, .ro-win-resize',
        'grid': 10,
        'min': { 'height': 100, 'width': 200 },
        'max': { 'height': 800, 'width': 400 }
    });

    $('.ragnarok-button, .ro-btn').on('mousedown', function()
    {
        $(this).addClass('click');
    });

    $('.ragnarok-button, .ro-btn').on('mouseup', function()
    {
        $(this).removeClass('click');
    });

    $('.ragnarok-checkbox, .ro-check').on('mousedown', function()
    {
        $(this).toggleClass('checked');
    });

    $('.ragnarok-window-button-close, .ro-win-btn-close').on('click', function()
    {
        $(this).parents('.ragnarok-window, .ro-win').remove();
    });

    $('.ragnarok-window-button-minimize, .ro-win-btn-min').on('click', function()
    {
        // This is so gross
        var parent = $(this).parents('.ragnarok-window, .ro-win');

        var height = parent.height();
        var previous_height = parent.attr('previous-height');
        
        if(previous_height)
        {
            parent.css({'height': previous_height});
            parent.removeAttr('previous-height');
        }
        else
        {
            parent.attr('previous-height', height);
            parent.css({'height': 'auto'});
        }
        
        parent.toggleClass('ro-min');

        // Especially this part
        parent.find('[ro-min-text]').each(function()
        {
            var text = $(this).html();
            var minimized = $(this).attr('ro-min-text');

            $(this).html(minimized);
            $(this).attr('ro-min-text', text);
        });

        // A little gross here too
        if(parent.hasClass('ro-min'))
        {
            if(parent.find('.ragnarok-window-minimized-content, .ro-win-min-content').length)
            {
                parent.css({'border-bottom-right-radius': '8px', 'border-bottom-left-radius': '8px'});
            }
        }
        
    });

    // Stop dragging when the mouse leaves the browser
    $('body').on('mouseleave', function()
    {
        console.log('mouseout!');
        $('.drag').trigger('mouseup');
    });

    $('body').on('mouseenter', '.ragnarok-hover, .ro-hover', function(event)
    {
        // Prevent hover when window is being dragged
        if($(this).parents('.ragnarok-window, .ro-win').length && $(this).parents('.ragnarok-window, .ro-win').hasClass('drag'))
            return;

        // Remove any previously created hover boxes
        $('.ro-hover-box').remove();
        $('.ro-hover-handle').remove();
        $('.ro-hovering').removeClass('ro-hovering');

        // Add hovering class to current element
        $(this).addClass('ro-hovering');
        
        var offset = $(this).offset();
        var hover = $("<div class='ro-hover-box'>"+$(this).attr('hover')+"</div>");
        var handle = $("<div class='ro-hover-handle'></div>");

        $('body').append(hover);
        $('body').append(handle);

        hover.css({'left': offset.left, 'top': offset.top - (hover.outerHeight(true) - $(this).outerHeight(true) * 0.2) });
        handle.css({'left': offset.left, 'top': offset.top, 'width': $(this).outerWidth(true), 'height': $(this).outerHeight(true)});

        // Make sure the hover box doesn't go outside the window
        if(offset.left + hover.outerWidth(true) > $(window).width())
        {
            var overflow = offset.left + hover.outerWidth(true) - $(window).width() 
            hover.css({'left': offset.left - overflow});
        }
    });

    $('body').on('mouseleave', '.ro-hover-handle', function(event)
    {
        $('.ro-hover-box').remove();
        $('.ro-hover-handle').remove();
    });

    $('body').on('mousedown', '.ro-hover-handle', function()
    {
        // Pass click event to the actual element being clicked on
        $('.ro-hovering').trigger('mousedown');
    });

    $('body').on('mousedown', '.ragnarok-item, .ro-item', function()
    {
        alert('CLICK');
    });
});
