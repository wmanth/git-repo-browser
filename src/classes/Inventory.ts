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
}
