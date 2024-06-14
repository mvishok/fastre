//array functions

export function arraySize(args){
    let size =0;
    for (let i = 0; i < args.length; i++){
        //arrays will be stringified. We need to parse them
        if (typeof args[i] == "string"){
            try {
                args[i] = JSON.parse(args[i]);
            } catch (error) {
                return 0;
            }
        }
        if (Array.isArray(args[i])){
            size += args[i].length;
        }
    }
    return size;
}