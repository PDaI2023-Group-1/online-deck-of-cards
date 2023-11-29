declare interface ImportMeta {
    env: {
        VITE_API_URL: string | undefined;
        VITE_DEV_API_URL: string | undefined;
        VITE_ENV: string | undefined;
        VITE_WS_URL: string | undefined;
        VITE_WS_PORT: string | undefined;
        DEV: boolean;
    };
}
