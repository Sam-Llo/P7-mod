import { Command } from "playa-core";

export type CommandSet = { [key: string]: (...pl) => Command } | null;
