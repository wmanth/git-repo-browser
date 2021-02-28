import { Logger } from 'tslog'

const GetRepoHome = () => {
    if (!process.env.REPO_HOME)
        throw new Error("REPO_HOME environment variable not set.")
    return process.env.REPO_HOME
}

export const log = new Logger({ displayFilePath: "hidden" })
export const PORT = process.env.PORT || 8080
export const REPO_HOME = GetRepoHome()
