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
 
        $(element).attr('window', id);
        $(element).css({'z-index': windows.length});

        return $el.on("mousedown", function(e)
        {
            // Only drag when left clicking
            if(e.which == 1)
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
            }
            
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
        $('.ro-item-drag').css({display: 'none'});
    });

    $('body').on('mousemove', function(event)
    {
        if(dragging)
        {
            $('.ro-item-drag').css({opacity: 1, top: event.clientY - 10, left: event.clientX - 6});
        }
    });

    function item_drag(element, opt, callback)
    {        
        element.on('mousedown', function(event, context)
        {            
            // Only drag on left clicks
            if(context.which == 1)
            {
                dragging = true;

                // Remove previous items once we click on a new one
                $('.ro-item-drag').remove();

                var item = $(this).find('img').clone();
                item.addClass('ro-item-drag');
                item.css({opacity: 0, position: 'fixed', 'z-index': 9001, 'pointer-events': 'none'});

                if(typeof opt.from != "undefined")
                    item.attr('from', opt.from);
                
                $('body').append(item);

                if(typeof callback == "function")
                    callback();
            }
        });
    }
    
    $.fn.drag = function(opt, callback)
    {
        if($(this).is('.ragnarok-item, .ro-item'))
            item_drag(this, opt, callback);

        else if($(this).is('.ragnarok-window, .ro-win'))
            window_drag(this, opt);
    }

    $.fn.drop = function(options, callback)
    {
        var drop = false;

        // Allow options to be.. optional!
        if(typeof options == "function")
        {
            callback = options;
            options = undefined;
        }

        options = $.extend({children: true}, options);
        
        if(options.children)
        {
            $(this).on('mouseenter', function(event)
            {
                drop = true;
            });

            $(this).on('mouseleave', function(event)
            {
                drop = false;
            });
        }
        else
        {            
            $(this).on('mouseover', function(event)
            {
                if(event.target != this)
                    return;
                    
                drop = true;
            });

            $(this).on('mouseout', function(event)
            {
                if(event.target != this)
                    return;

                drop = false;
            });
        }
        
        $('body').on('mouseup', function(event)
        {
            if(drop)
            {
                if(typeof callback == "function")
                    callback(event);
            }
        });
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

                var offset = 24;

                if(parent.find('.ragnarok-window-footer, .ro-win-foot'))
                    offset += parent.find('.ragnarok-window-footer, .ro-win-foot').outerHeight(true);
                
                var pane = parent.find('.ragnarok-scroll-pane').attr('ro-pane-id');
                ragnarok.panes[pane].getContentPane().parents('.jspContainer').css({'height': height - offset});
                ragnarok.panes[pane].reinitialise();

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

                var pane = parent.find('.ragnarok-scroll-pane').attr('ro-pane-id');

                // Panefix
                var scrollbar = ragnarok.panes[pane].getContentPane().parents('.ragnarok-window, .ro-win').find('.jspDrag');
                scrollbar.height(scrollbar.height() - 8);
                
                $('.jspTrack, .jspArrow').addClass('ro-btn');
                
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
