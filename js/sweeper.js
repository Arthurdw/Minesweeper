// Code by ©Arthurdw
// Feel free to play around with these values:
const setup = {
    field: {
        rows: 50,
        itemsPerRow: 50,
        width: 500,
        height: 500
    }
};

// Here we will save data:
let data = [],
    _points = 99,
    retryEnabled = false;


// This is where the magic happens!

// Create our base/root variables:
let root = document.documentElement;
let field = document.getElementById("sweeper");
let points = document.getElementById("points");
let title = document.getElementById("title");
let retry = document.getElementById("retry");
let playtime = document.getElementById("playtime");

// Prevent the context menu to show up when a right click occurs:
document.addEventListener("contextmenu", function (e) {
    e.preventDefault();
});

// Add a event listener for the retry button:
retry.addEventListener("click", retryMinesweeper);

// Initialize our CSS variables:
root.style.setProperty("--field-size-width", setup.field.width + "px");
root.style.setProperty("--field-size-height", setup.field.height + "px");
root.style.setProperty("--item-row-count", setup.field.rows);
root.style.setProperty("--item-row-item-count", setup.field.itemsPerRow);

// Create our Item class, this is the object that will store our data:
class Item {
    constructor(object, index, bomb) {
        this.index = index;
        this.obj = object;
        this.bomb = bomb;
        this.inner = 0;
        this.active = false;
        this.marked = false;
        this.updated = false;
    }

    // Update the object, this will allow us to display the item correctly:
    async update(rightClick = false) {
        if (!this.updated) {
            if (!(this.bomb || this.inner == 0 || this.marked)) {
                let text = document.createElement("p");
                text.innerHTML = this.inner;
                this.obj.append(text);
            }
            this.obj.style.backgroundColor = this.marked ? "salmon" : this.active && this.bomb ? "red" : this.inner > 0 ? "#414141" : this.active ? "darkgray" : "greenyellow";
            this.updated = true;
            if (this.inner == 0 && !this.bomb && !rightClick) clickEmptyRelative(this.index);
            if (this.bomb && !this.marked) {
                title.innerHTML = "Minesweeper made by Arthurdw<br><span style='color: red; font-weight: bold;'>You triggered a mine!</span>";
                retry.style.opacity = 1;
                retry.style.cursor = "pointer";
                retryEnabled = true;
                for (let i = 0; i < data.length; i++) {
                    data[i].updated = true;
                    if (!data[i].obj.style.backgroundColor) data[i].obj.style.backgroundColor = data[i].bomb ? "red" : "yellow";
                }
            }
        }
    }
}

// The init function sets up the field.
function init() {
    // Create all our items:
    for (let i = 0; i < setup.field.rows; i++) {
        for (let j = 0; j < setup.field.itemsPerRow; j++) {
            let obj = document.createElement("div");
            var item = new Item(obj, i * setup.field.rows + j, Math.random() >= 0.9);
            obj.setAttribute("data-idx", item.index);
            obj.addEventListener("click", displayItem);
            obj.addEventListener("contextmenu", addFlag);
            field.append(obj);
            data.push(item);
        }
    }

    // Mine detector numbers:
    for (let i = 0; i < setup.field.rows; i++) {
        for (let j = 0; j < setup.field.itemsPerRow; j++) {
            data[i * setup.field.rows + j].inner = (
                updateItemInner(j, i * setup.field.rows + j + 1) +
                updateItemInner(j, i * setup.field.rows + j - 1) +
                updateItemInner(j, (i * setup.field.rows) - setup.field.itemsPerRow + j) +
                updateItemInner(j, (i * setup.field.rows) - setup.field.itemsPerRow + j + 1) +
                updateItemInner(j, (i * setup.field.rows) - setup.field.itemsPerRow + j - 1) +
                updateItemInner(j, (i * setup.field.rows) + setup.field.itemsPerRow + j) +
                updateItemInner(j, (i * setup.field.rows) + setup.field.itemsPerRow + j + 1) +
                updateItemInner(j, (i * setup.field.rows) + setup.field.itemsPerRow + j - 1));
        }
    }
}

// Display an item:
function displayItem() {
    data[this.getAttribute("data-idx")].active = true;
    data[this.getAttribute("data-idx")].update();
}

// Add a flag to an item:
function addFlag() {
    if (_points <= 0) points.innerHTML = 0;
    else {
        data[this.getAttribute("data-idx")].marked = true;
        --_points;
        points.innerHTML = _points;
        data[this.getAttribute("data-idx")].update(true);
    }
}

// Mine detectors:
function updateItemInner(subindex, index) {
    if ((subindex == 0 && index % setup.field.rows == setup.field.itemsPerRow - 1) ||
        (subindex == setup.field.itemsPerRow - 1 && index % setup.field.rows == 0)) return 0;
    try {
        return data[index].bomb ? 1 : 0;
    } catch (TypeError) {
        return 0;
    }
}

// Find other empty item slots
function clickEmptyRelative(index) {
    if ((index - 1) % setup.field.itemsPerRow != setup.field.itemsPerRow - 1) emptyRelativeHelper(index - 1);
    if ((index + 1) % setup.field.itemsPerRow != 0) emptyRelativeHelper(index + 1);
    emptyRelativeHelper(index + setup.field.itemsPerRow);
    emptyRelativeHelper(index - setup.field.itemsPerRow);
}

// A helper function for the function above this. (clickEmptyRelative)
async function emptyRelativeHelper(index) {
    try {
        if (!data[index].bomb) {
            await sleep(50)
            data[index].active = true;
            data[index].update();
        }
    } catch (TypeError) {}
}

// Just a little delay fuction to let the animations function properly:
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Restart the game:
function retryMinesweeper() {
    if (retryEnabled) {
        _points = 99;
        retryEnabled = false;
        retry.style.opacity = 0;
        retry.style.cursor = "default";
        title.innerHTML = "Minesweeper made by Arthurdw"
        for (let i = 0; i < data.length; i++) field.removeChild(data[i].obj);
        data = [];
        init();
    }
}

// Just a little worthless timer:
setInterval(function () {
    const val = parseInt(localStorage.getItem("playtime"));
    if (!val) localStorage.setItem("playtime", 1);
    else localStorage.setItem("playtime", val + 1);
    playtime.innerHTML = `${Math.floor(val / 3600)}:${Math.floor((val / 60) % 60)}:${val % 60}`;
}, 1000);

init()
