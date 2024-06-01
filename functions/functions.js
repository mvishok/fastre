import Database from 'better-sqlite3'

let db;

function init(dir){
    db = new Database(dir + "/database.db");
}

function log(n){
    if(n.length === 1){
        console.log(n[0]);
    } else {
        console.log(n);
    }
    return "";
}

function count(args){
    let id = args[0];
    let fn = args[1];

    db.prepare("CREATE TABLE IF NOT EXISTS counter (id TEXT PRIMARY KEY, value INTEGER)").run();
    //if fn == display, display the value of the counter
    if(fn === "display"){
        let value = db.prepare("SELECT value FROM counter WHERE id = ?").get(id);
        if (value === undefined){
            db.prepare("INSERT INTO counter (id, value) VALUES (?, 0)").run(id);
            return 0;
        }
        return value.value;
    } else if (fn === "increment"){
        db.prepare("UPDATE counter SET value = value + 1 WHERE id = ?").run(id);
        return "";
    } else if (fn === "decrement"){
        db.prepare("UPDATE counter SET value = value - 1 WHERE id = ?").run(id);
        return "";
    } else if (fn === "reset"){
        db.prepare("UPDATE counter SET value = 0 WHERE id = ?").run(id);
        return "";
    } else if (fn === "onclick"){
        //return a string that will be used in the onclick attribute of a button. it should send a request to the server to increment the counter, /counter?id=1&fn=increment
        return `fetch('/counter?id=${id}&fn=increment')`;
    }
}

export {
    init,
    log,
    count
}