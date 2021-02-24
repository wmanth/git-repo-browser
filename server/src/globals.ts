import { Logger } from 'tslog'
import Inventory from "./classes/Inventory.js"

export const log = new Logger({ displayFilePath: "hidden" })
export const PORT = process.env.PORT || 8080
export const REPO_HOME = process.env.REPO_HOME

export const RepoInventory = Inventory.getInstance()
