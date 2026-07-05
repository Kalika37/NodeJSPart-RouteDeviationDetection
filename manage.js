const connectDB = require("./config/db");
const dotenv = require("dotenv");
const {AdminManager,closeInterface} = require("./administrator/index");

dotenv.config();
const LoadManager = require("./administrator/loader");

async function StartProcess() {
    try {
        await connectDB();
        
        switch (process.argv[2]) {
            case "admin":
                const admin = new AdminManager(process.argv);
                await admin.init(); // Wait for prompts to complete
                break;
            
            default:
                console.log("Invalid command");
        }
    } catch (error) {
        console.error("Process error:", error);
    } finally {
        // ALWAYS close the input stream when done so the console finishes
        closeInterface(); 
        process.exit(0);
    }
}

StartProcess();
