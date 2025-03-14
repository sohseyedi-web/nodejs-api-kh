const { userAuthRoutes } = require("./auth");
const router = require("express").Router();

router.use("/user", userAuthRoutes);

module.exports = router;
