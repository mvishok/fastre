export default function main(tag){
    const till = parseInt(tag.attr('till')) || 10;
    const seperator = tag.attr('seperator') || "<br>";
    
    let result = "";
    for (let i = 0; i < till; i++){
        if (i % 2 !== 0){
            result += i + seperator;
        }
    }

    return result;
}