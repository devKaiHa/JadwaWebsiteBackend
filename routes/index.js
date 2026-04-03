const express = require("express");

const authRouter = require("./AuthRout");
const BlogRouter = require("./blogRout");
const CategoryRouter = require("./CategoryRout");
const boardMemberRouter = require("./boardMemberRoute");
const investmentFundsRouter = require("./InvestmentFundsRout");
const contactUsRouter = require("./contactUsRoute");
const companiesRouter = require("./CompaniesRout");
const sectorsRouter = require("./Home/sectorRoute");
const footerRouter = require("./Home/footerRoute");
const partnerRouter = require("./Home/partnerRoute");
const aboutHomeRouter = require("./Home/aboutHomeRoute");
const homeSliderRouter = require("./Home/homeSliderRoute");
const valuesRouter = require("./Home/valuesRoute");
const aboutServiceRouter = require("./Service/aboutServiceRoute");
const plansRouter = require("./Service/plansRoute");
const MessagesRoute = require("./MessagesRoute");
const usersRouter = require("./userRoute");
const ourServicesRouter = require("./Service/ourServiceRoute");

const router = express.Router();

router.use("/auth", authRouter);
router.use("/about-home", aboutHomeRouter);
router.use("/footer", footerRouter);
router.use("/home-slider", homeSliderRouter);
router.use("/partners", partnerRouter);
router.use("/sectors", sectorsRouter);
router.use("/values", valuesRouter);
router.use("/about-service", aboutServiceRouter);
router.use("/our-services", ourServicesRouter);
router.use("/categories", CategoryRouter);
router.use("/plans", plansRouter);
router.use("/blog", BlogRouter);
router.use("/board-member", boardMemberRouter);
router.use("/investment-funds", investmentFundsRouter);
router.use("/messages", MessagesRoute);
router.use("/users", usersRouter);
router.use("/contact-us", contactUsRouter);
router.use("/companies", companiesRouter);

module.exports = router;
