import { cronJobs } from "convex/server";
import { api } from "./_generated/api";

const crons = cronJobs();

crons.cron("Event Watchers", "*/5 * * * *", api.jobs.eventWatchers.main);

export default crons;
