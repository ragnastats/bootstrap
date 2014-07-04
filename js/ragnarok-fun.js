$(document).ready(function()
{
    $('body').on('click', '.ro-funtime', function(event)
    {
        var every = [];
        
        $.each(ragnarok.items, function(id, item)
        {
            every.push({item: id, quantity: 1});
        });

        ragnarok.storage.items = every;
        $('.ragnarok-tab-storage, .ro-tab-stor').eq(0).trigger('click');
    });

});
