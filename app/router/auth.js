const expressAsyncHandler = require("express-async-handler");
const { verifyAccessToken } = require("../middleware/auth.middleware");
const router = require("express").Router();
const UserAuthController = require("../controller/auth.controller");

router.post("/signup", expressAsyncHandler(UserAuthController.signup));
router.post("/signin", expressAsyncHandler(UserAuthController.signin));
router.get(
  "/refresh-token",
  expressAsyncHandler(UserAuthController.refreshToken)
);
router.patch(
  "/update",
  verifyAccessToken,
  expressAsyncHandler(UserAuthController.updateProfile)
);

router.get(
  "/profile",
  verifyAccessToken,
  expressAsyncHandler(UserAuthController.getUserProfile)
);

router.post("/logout", expressAsyncHandler(UserAuthController.logout));

module.exports = {
  userAuthRoutes: router,
};
