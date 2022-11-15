export let db;
export let lastID;
var lastEvent = new Map();

function openReq(version) {
    var openRequest;
    var prom = new Promise((resolve, reject) => {
        openRequest = window.indexedDB.open("events_db", version);
        openRequest.onupgradeneeded = e => {
            db = e.target.result;

            const objStore = db.createObjectStore('0', { keyPath: "id" });

            objStore.createIndex("title", "title", { unique: false });
            objStore.createIndex("start", "start", { unique: false });
            objStore.createIndex("end", "end", { unique: false });
            objStore.createIndex("place", "place", { unique: false });

            console.log("Database setup complete");
        };
        openRequest.onsuccess = e => resolve(e);
        openRequest.onerror = e => reject(e);
    });

    prom.then(e => {
        db = openRequest.result;
        console.log("Database opened successfully");
        var storeNames = db.objectStoreNames;
        for (var i = 0; i < storeNames.length; i++)
            lastEvent.set(storeNames[i], getLastEvent(storeNames[i]));
    }).catch(e => {
        // console.error(`indexedDB error: ${ e.target.errorCode }`);
        openReq(version + 1);
    });
}

openReq(1);

export function addEventDB(Title, Start, End, Place, msv) {
    lastID++;
    const newEvent = { id: lastID,
                        title: Title,
                        start: Start,
                         end: End,
                         place: Place };
    let dbOpenRequest = db.transaction([msv], "readwrite")
        .objectStore(msv)
        .add(newEvent);
    dbOpenRequest.onerror = () => console.log("Transaction not opened due to error");
    dbOpenRequest.onsuccess = () => console.log("Add completed");
}

export function getLastEvent(msv) {
    const objectStore = db.transaction([msv]).objectStore(msv);
    return new Promise((resolve, reject) => {
        if (lastEvent.get(msv))
            resolve(lastEvent.get(msv));
        else {
            let cursor = objectStore.openCursor(null, 'prev');
            cursor.onsuccess = e => {
                lastID = cursor.result ? cursor.result.value.id : 1;
                resolve(cursor.result);
            };
            cursor.onerror = () => reject("Fail getting cursor getLastEvent");
        }
    });
}

export function createNewTable(msv) {
    return new Promise((resolve, reject) => {
        var version =  parseInt(db.version);
        db.close();
        var req = window.indexedDB.open("events_db", version + 1);
        req.onsuccess = e => resolve("New table opened successfully");
        req.onupgradeneeded = e => {
            db = e.target.result;

            const objectStore = db.createObjectStore(msv, { keyPath: "id" });

            objectStore.createIndex("title", "title", { unique: false });
            objectStore.createIndex("start", "start", { unique: false });
            objectStore.createIndex("end", "end", { unique: false });
            objectStore.createIndex("place", "place", { unique: false });

            console.log("Database setup complete");
        };
        req.onerror = e => reject("Failed to open new table");
    });
}

function printTable(stores, i) {
    if (i == stores.length)
        return;
    console.log("Store name: " + stores[i])
    const objectStore = db.transaction(stores[i]).objectStore(stores[i]);
    var prom = new Promise((resolve, reject) => {
        var myCursor = objectStore.count();
        myCursor.onsuccess = e => resolve(myCursor.result);
    });
    prom.then(res => {
        console.log('Total events: ', res);
        printTable(stores, i + 1);
    });
}

export function printAll() {
    var stores = db.objectStoreNames;
    console.log("DB tables: \n")
    printTable(stores, 0);
}

export function deleteEventDB(id, msv) {
    db.transaction([msv], "readwrite")
        .objectStore(msv)
        .delete(parseInt(id))
        .onsuccess = () => console.log(`Note ${id} deleted.`);
}

export function updateEventDB(id, startTime, endTime, msv) {
    const objectStore = db.transaction([msv], "readwrite").objectStore(msv);
    const req = objectStore.get(parseInt(id));
    req.onsuccess = () => {
    console.log(id, startTime, endTime, msv, req.result);
        var event = req.result;
        event.start = startTime;
        event.end = endTime;
        objectStore.put(event)
                    .onsuccess = () => console.log('update event success');
    }
}

function deleteDatabase() {
    if (db)
        db.close();
    var req = indexedDB.deleteDatabase("events_db");
    req.onsuccess = function () {
        console.log("Deleted database successfully");
    };
    req.onerror = function () {
        console.log("Couldn't delete database");
    };
    req.onblocked = function () {
        console.log("Couldn't delete database due to the operation being blocked");
    };
}

$("#resetDB").on("click", deleteDatabase);