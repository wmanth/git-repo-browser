import Server from "./server";
import { DefaultConfig } from "./classes/Config";

const server = new Server(DefaultConfig.instance);
server.listen();
