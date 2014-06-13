function check_weight(obj) {
    var count = 0, hasWeight = 0;

    for(var prop in obj) {
        if(obj.hasOwnProperty(prop))
        {
            if(typeof obj[prop].weight != "undefined")
            {
                hasWeight++;
            }
            else
            {
                console.log(obj[prop]);
            }
            
            ++count;
        }
    }

    return {total: count, weight: hasWeight};
}

check_weight(ragnarok.items);
