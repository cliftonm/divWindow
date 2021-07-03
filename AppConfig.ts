import { AppMain } from "./AppMain"

require(['AppMain'],
    (main: any) => {
        const appMain = new AppMain();
        appMain.run();
    }
);
