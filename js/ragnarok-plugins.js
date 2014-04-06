
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
    
    $.fn.drag = function(opt)
    {
        opt = $.extend({handle:""}, opt);

        if(opt.handle === "") {
            var $el = this;
        } else {
            var $el = this.find(opt.handle);
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

                if(e.pageY + pos_y > $(window).height())
                {
                    top -= e.pageY + pos_y - $(window).height();
                }
                else if(e.pageY + pos_y < drg_h)
                {
                    top = 0;
                }

                if(e.pageX + pos_x > $(window).width())
                {
                    left -= e.pageX + pos_x - $(window).width();
                }
                else if(e.pageX + pos_x < drg_w)
                {
                    left = 0;
                }
                
                $('.drag').offset({
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
    
    // Requires:
        // opt.handle - selector for the resize handle
        // opt.window - selector for the parent window
    // Optional:
        // opt.grid - size of grid to snap to
    $.resize = function(opt)
    {
        console.log('hi');
        opt = $.extend({'grid': 1}, opt);

        var resizing = false;
        var resize = {'grid': opt.grid};
        
        $(document).on('mousedown', opt.handle, function()
        {
            console.log('mousedown');      
            resizing = true;
            $(this).addClass('resize');
            
            resize.element = $(this);
            resize.offset = $(this).parents(opt.window).offset();
            resize.width = $(this).parents(opt.window).width();
            resize.height = $(this).parents(opt.window).height();
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

                resize.element.parents(opt.window).css({'width': width, 'height': height});
                return false;
            }
        });

        $(document).on('mouseup', function()
        {
            resizing = false;
        });

        $(document).on('mouseleave', function()
        {
            resizing = false;
        });
    }
})(jQuery);
