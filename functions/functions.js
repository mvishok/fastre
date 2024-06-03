import Database from 'better-sqlite3'

let db;

function init(dir){
    db = new Database(dir + "/database.db");
    db.prepare("CREATE TABLE IF NOT EXISTS counter (id TEXT PRIMARY KEY, value INTEGER)").run();
    db.prepare("CREATE TABLE IF NOT EXISTS variables (name TEXT PRIMARY KEY, value TEXT, t VARCHAR(10))").run();
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

    //if fn == display, display the value of the counter
    if(fn === "display"){
        let value = db.prepare("SELECT value FROM counter WHERE id = ?").get(id);
        if (value === undefined){
            db.prepare("INSERT INTO counter (id, value) VALUES (?, 0)").run(id);
            return 0;
        }
        return value.value;
    } else if (fn === "increment"){
        if (db.prepare("SELECT value FROM counter WHERE id = ?").get(id) === undefined){
            db.prepare("INSERT INTO counter (id, value) VALUES (?, 1)").run(id);
        } else {
            db.prepare("UPDATE counter SET value = value + 1 WHERE id = ?").run(id);
        }
        return "";
    } else if (fn === "decrement"){
        if (db.prepare("SELECT value FROM counter WHERE id = ?").get(id) === undefined){
            db.prepare("INSERT INTO counter (id, value) VALUES (?, -1)").run(id);
        } else {
            db.prepare("UPDATE counter SET value = value - 1 WHERE id = ?").run(id);
        }
        return "";
    } else if (fn === "reset"){
        if (db.prepare("SELECT value FROM counter WHERE id = ?").get(id) === undefined){
            db.prepare("INSERT INTO counter (id, value) VALUES (?, 0)").run(id);
        } else {
            db.prepare("UPDATE counter SET value = 0 WHERE id = ?").run(id);
        }
        return "";
    } else if (fn === "onclick"){
        //return a string that will be used in the onclick attribute of a button. it should send a request to the server to increment the counter, /counter?id=1&fn=increment
        if (db.prepare("SELECT value FROM counter WHERE id = ?").get(id) === undefined){
            db.prepare("INSERT INTO counter (id, value) VALUES (?, 0)").run(id);
        }
        return `fetch('/counter?id=${id}&fn=increment')`;
    }
}

function set(args){
    let name = args[0];
    let val = args[1];
    //find the type of the value
    let t = typeof val;
    if(t === "object"){
        t = "array";
    }
    db.prepare("INSERT OR REPLACE INTO variables (name, value, t) VALUES (?, ?, ?)").run(name, val, t);

    return "";
}

function get(args){
    if (args.length === 0){
        return "";
    } else {
        let r = [];
        for (const n of args){
            //this method gets variable value from variables
            let val = db.prepare("SELECT value FROM variables WHERE name = ?").get(n);
            if(val === undefined){
                return "";
            }
            
            if(val.t === "number"){
                r.push(Number(val.value));
            } else if(val.t === "array"){
                r.push(JSON.parse(val.value));
            } else {
                r.push(val.value);
            }
        }
        if(r.length === 1){
            return r[0];
        } else {
            return r;
        }
    }
    
}

export {
    init,
    log,
    count,
    set,
    get
}