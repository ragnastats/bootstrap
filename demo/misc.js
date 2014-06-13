function check_weight(obj) {
    var count = 0, hasWeight = 0, noWeight = 0, noDesc = 0;

    for(var prop in obj) {
        if(obj.hasOwnProperty(prop))
        {
            if(typeof obj[prop].weight != "undefined")
            {
                hasWeight++;
            }
            else
            {
                noWeight++;
                
                if(typeof obj[prop].desc != "undefined")
                {
                    if(obj[prop].desc.indexOf('Weight') > -1)
                        console.log(obj[prop]);
                }
                else
                {
                    console.log(obj[prop]);
                    noDesc++;
                }
            }
            
            ++count;
        }
    }

    return {total: count, missing: {weight: noWeight, desc: noDesc}};
}

check_weight(ragnarok.items);
