const { exec } = require("child_process");

export class ProcessManager {
    static spawnBot() {
        exec("npm run bot", (error: any, stdout: any, stderr: any) => {
            if (error) {
                console.error(`exec error: ${error}`);
                return;
            }
        });
    }
}
