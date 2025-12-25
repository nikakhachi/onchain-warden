import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// crons.cron("Event Watchers", "*/1 * * * *", internal.jobs.eventWatchers.main);

export default crons;
