export default function main(tag, strRender){
    const till = parseInt(strRender(tag.attr('till'))) || 10;
    const seperator = strRender(tag.attr('seperator')) || "<br>";
    
    let result = "";
    for (let i = 0; i < till; i++){
        if (i % 2 !== 0){
            result += i + seperator;
        }
    }

    return result;
}