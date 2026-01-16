import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.cron("Event Watchers (1m)", "*/1 * * * *", internal.jobs.eventWatchers.main, { interval: "1m" });

// TODO run once a day
// crons.cron("Event Watchers (1d)", "0 0 * * *", internal.jobs.eventWatchers.main, { interval: "1d" });

export default crons;
