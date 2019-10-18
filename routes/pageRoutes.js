const express = require("express");
const router = express.Router();
const pageController = require("../controllers/pagesController");
const dashboardController = require("../controllers/dashboardController");
const analyticsController = require("../controllers/analyticsController");
const authController = require("../controllers/authController");

// adding addition middlewares
const authAccessonly = require("../middlewares/authAccess");
router.get("/", pageController.index);
router.get("/pricing", pageController.pricingPage);
router.use(authAccessonly);
// dashboard routes
router.get(
  ["/dashboard", "/recentDashboard/:id"],

  dashboardController.getDashboards
);
router.get("/search", dashboardController.getSearchPage);
router.post("/search", dashboardController.getSearchPage);
router.post("/analyze", analyticsController.analyseTwitterData);
router.get("/auth/logout", authController.getLogout);
router.get("/posts/:id?", dashboardController.getPosts);
router.get("/influencers", dashboardController.getInfluencers);
router.get(
  ["/sentiment", "/recentSentiment/:id"],

  dashboardController.getSentiment
);
router.get(
  ["/buzzwords", "/recentBuzzwords/:id"],

  dashboardController.getBuzzwords
);
router.get("/recents", dashboardController.getRecents);
router.get("/onlyrecent", dashboardController.getonlyRecents);
router.get("/auth/profile/:id", authController.profile);
router.get("/auth/edituser/:id", authController.editForm);
router.post("/update/:id", authController.update);
router.get("/deleteUser/:id", authController.Delete);
router.get("/upload/:id", authController.Upload);
router.post("/uploaduser/:id", authController.Uploaduser);

module.exports = router;
