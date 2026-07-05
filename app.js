const express = require("express");
const dotenv = require("dotenv");


const app = express();
app.use(express.json());

// Routes
app.use("/api/roads", require("./routes/roadRoutes"));
app.use("/api/gps", require("./routes/gpsRoutes"));

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
    console.log(`Server running on port ${PORT}`);
    // await run()
});
