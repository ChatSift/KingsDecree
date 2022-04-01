declare namespace NodeJS {
    export interface ProcessEnv {
        DISCORD_TOKEN: string;
        PREFIX: string;
        CHAT_CHANNEL: string;
        GUILD_ID: string;
        DECREE_CHANNEL: string;
        STAFF_ROLE: string;
        EVENT_ROLE: string;
    }
}
