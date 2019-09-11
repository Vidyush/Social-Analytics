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
router.use(authAccessonly)
// dashboard routes
router.get(["/dashboard","/recentDashboard/:id"], authAccessonly, dashboardController.getDashboards);
router.get("/search", authAccessonly, dashboardController.getSearchPage);
router.post("/search", authAccessonly, dashboardController.getSearchPage);
router.post("/analyze",authAccessonly,analyticsController.analyseTwitterData);
router.get("/auth/logout", authController.getLogout);
router.get("/posts", authAccessonly, dashboardController.getPosts);
router.get("/influencers", authAccessonly, dashboardController.getInfluencers);
router.get(["/sentiment","/recentSentiment/:id"], authAccessonly, dashboardController.getSentiment);
router.get(["/buzzwords","/recentBuzzwords/:id"], authAccessonly, dashboardController.getBuzzwords);
router.get("/recents", authAccessonly, dashboardController.getRecents);
router.get("/onlyrecent", authAccessonly, dashboardController.getonlyRecents);
router.get('/auth/profile/:id',authAccessonly,authController.profile)
router.get('/auth/edituser/:id',authAccessonly,authController.editForm)
router.post('/update/:id',authAccessonly,authController.update)
router.get('/deleteUser/:id',authAccessonly,authController.Delete)
router.get('/upload/:id',authAccessonly,authController.Upload)
router.post('/uploaduser/:id',authAccessonly,authController.Uploaduser)

module.exports = router;
