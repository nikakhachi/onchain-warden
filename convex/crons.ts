import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.cron("Pro Event Watchers", "*/1 * * * *", internal.jobs.proEventWatcher.main);

crons.cron("Free Event Watchers", "0 * * * *", internal.jobs.freeEventWatcher.main);

export default crons;
