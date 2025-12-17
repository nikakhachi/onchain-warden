import { cronJobs } from "convex/server";
import { api } from "./_generated/api";

const crons = cronJobs();

crons.cron("Notify", "*/5 * * * *", api.notify.notify);

export default crons;
