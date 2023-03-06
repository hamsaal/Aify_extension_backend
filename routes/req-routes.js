const express = require("express");
const router = express.Router();
const { reqAI } = require("../../reqFunc");
router.get("/", (req, res) => {
  res.send("Hello");
});
router.post("/chat", async (req, res) => {
  const resAI = await reqAI(req.body, req.uid);
  res.status(resAI.code).send(resAI.content);
});
module.exports = router;
