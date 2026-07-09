import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import orgRouter from "./organizations";
import branchRouter from "./branches";
import crmRouter from "./crm";
import commerceRouter from "./commerce";
import aiRouter from "./ai";
import analyticsRouter from "./analytics";
import knowledgeRouter from "./knowledge";
import webhookRouter from "./webhooks";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/auth", authRouter);
router.use(orgRouter); // handles /organizations, /business-profile
router.use("/branches", branchRouter);
router.use(crmRouter); // handles /customers, /leads, /inquiries, /tasks
router.use(commerceRouter); // handles /products, /services, /orders, /appointments, /tickets, /invoices, /payments, /campaigns
router.use("/copilot", aiRouter); // handles /copilot/chat, /copilot/onboarding
router.use("/analytics", analyticsRouter); // handles /analytics/dashboard
router.use("/knowledge", knowledgeRouter); // handles /knowledge/upload, /knowledge/query
router.use("/webhooks", webhookRouter); // handles /webhooks/whatsapp

export default router;
