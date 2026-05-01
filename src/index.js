const express = require("express");
const app = express();

app.get("/", async (req, res) => {
    res.send("OK - Orthant")
})

app.listen(8003)