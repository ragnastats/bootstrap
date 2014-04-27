/***************************************
 *
 * Custom jQuery plugins
 *
 */


// From
// http://css-tricks.com/snippets/jquery/draggable-without-jquery-ui/
// Oh god this is so terrible...
(function($) {
    var windows = [];

    function layer_windows()
    {
        $.each(windows, function(index, id)
        {
            $("[window='"+id+"']").css('z-index', index + 1);
        });
    }

    function window_drag(element, opt)
    {
        opt = $.extend({handle:""}, opt);

        if(opt.handle === "") {
            var $el = element;
        } else {
            var $el = element.find(opt.handle);
        }


        var id = windows.length + 1;
        windows.push(id);

        $(this).attr('window', id);        
        $(this).css({'z-index': windows.length});

        return $el.on("mousedown", function(e)
        {
            if(opt.target && opt.target.length)
            {
                var match = false;
                
                $.each(opt.target, function(index, target)
                {
                    if($(e.target).hasClass(target))
                        match = true;
                })

                if(!match)
                    return;
            }
            
            if(opt.handle === "") {
                var $drag = $(this).addClass('drag');
            } else {
                var $drag = $(this).addClass('drag-active').parent().addClass('drag');
            }
            var drg_h = $drag.outerHeight(true),
                drg_w = $drag.outerWidth(true),
                pos_y = $drag.offset().top + drg_h - e.pageY,
                pos_x = $drag.offset().left + drg_w - e.pageX;
                
            $drag.css('z-index', 1000).parents().on("mousemove", function(e) {
                var top = e.pageY + pos_y - drg_h;
                var left = e.pageX + pos_x - drg_w;

                if(e.pageY + pos_y > $(document).height())
                {
                    top -= e.pageY + pos_y - $(document).height();
                }
                else if(e.pageY + pos_y < drg_h)
                {
                    top = 0;
                }

                if(e.pageX + pos_x > $(document).width())
                {
                    left -= e.pageX + pos_x - $(document).width();
                }
                else if(e.pageX + pos_x < drg_w)
                {
                    left = 0;
                }
                
                $('.drag').css({
                    position: 'absolute',
                    right: 'auto',
                    bottom: 'auto',
                    top:top,
                    left:left
                });
            });

            e.preventDefault(); // disable selection
        }).on("mouseup", function() {
            if(opt.handle === "") {
                $(this).removeClass('drag');
            } else {
                $(this).removeClass('drag-active').parent().removeClass('drag');
            }

            var index = windows.indexOf(parseInt($(this).attr('window')));           
            windows.remove(index);
            windows.push(parseInt($(this).attr('window')));

            layer_windows();
        });
    }

    var dragging = false;

    $('body').on('mousedown', function(event)
    {
        event.preventDefault();
    });

    $('body').on('mouseup', function(event)
    {
        dragging = false;
        $('.ro-item-drag').remove();
    });

    $('body').on('mousemove', function(event)
    {
        if(dragging)
        {
            $('.ro-item-drag').css({opacity: 1, top: event.clientY - 8, left: event.clientX - 8});
        }
    });

    function item_drag(element, opt)
    {        
        element.on('mousedown', function(event)
        {
            dragging = true;

            var item = $(this).find('img').clone();
            item.addClass('ro-item-drag');
            item.css({opacity: 0, position: 'fixed', 'z-index': 9001});
            
            $('body').append(item);
        });
    }
    
    $.fn.drag = function(opt)
    {
        if($(this).is('.ragnarok-item, .ro-item'))
            item_drag(this, opt);

        else if($(this).is('.ragnarok-window, .ro-win'))
            window_drag(this, opt);
    }
    
    // Requires:
        // opt.handle - selector for the resize handle
    // Optional:
        // opt.grid - size of grid to snap to
    $.fn.resize = function(opt)
    {
        opt = $.extend({'grid': 1, 'min': {}, 'max': {}}, opt);

        var resizing = false;
        var resize = {'grid': opt.grid};
        var parent = $(this);
        
        $(this).find(opt.handle).on('mousedown', function()
        {            
            console.log('mousedown');      
            resizing = true;
            $(this).addClass('resize');
            
            resize.offset = parent.offset();
            resize.width = parent.width();
            resize.height = parent.height();

            var index = windows.indexOf(parseInt(parent.attr('window')));           
            windows.remove(index);
            windows.push(parseInt(parent.attr('window')));

            layer_windows();
        });

        $(document).on('mousemove', function(event)
        {
            if(resizing)
            {
                console.log('mousemove');

                var width = event.pageX - resize.offset.left;
                var height = event.pageY - resize.offset.top;

                width -= width % resize.grid;
                height -= height % resize.grid;

                if(width < opt.min.width)
                    width = opt.min.width;

                if(height < opt.min.height)
                    height = opt.min.height;

                if(width > opt.max.width)
                    width = opt.max.width;

                if(height > opt.max.height)
                    height = opt.max.height;

                parent.css({'width': width, 'height': height});
                return false;
            }
        });

        $(document).on('mouseup', function()
        {
            if(resizing)
            {
                var index = windows.indexOf(parseInt(parent.attr('window')));           
                windows.remove(index);
                windows.push(parseInt(parent.attr('window')));

                layer_windows();
            }

            resizing = false;
        });

        $(document).on('mouseleave', function()
        {
            if(resizing)
            {
                var index = windows.indexOf(parseInt(parent.attr('window')));           
                windows.remove(index);
                windows.push(parseInt(parent.attr('window')));

                layer_windows();
            }

            resizing = false;
        });
    }
})(jQuery);
