import fs from "fs";
import path from "path";
import * as Global from "../globals.js"

interface Dictionary<T> {
    [key: string]: T;
}

interface InventoryEntry {
    name: string
    local: string
    remote: string
}

export default class Inventory {
    private entries: Dictionary<InventoryEntry>
    private static instance: Inventory

    private constructor() {
        // check if the REPO_HOME environment variable is set
        if (Global.REPO_HOME === undefined) {
            throw new Error("REPO_HOME environment variable not set.")
        }
        // read the repository inventory file
        const inventoryPath = path.join(Global.REPO_HOME, 'repos.json')
        const data = fs.readFileSync(inventoryPath, 'utf8')
        this.entries = JSON.parse(data)
    }

    static getInstance(): Inventory {
        if (!Inventory.instance) {
            Inventory.instance = new Inventory()
        }
        return Inventory.instance
    }

    getEntry(key: string): InventoryEntry {
        return this.entries[key]
    }

    allEntries(): Dictionary<InventoryEntry> {
        return this.entries
    }
}
