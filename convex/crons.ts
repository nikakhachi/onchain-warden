import { cronJobs } from "convex/server";
import { api } from "./_generated/api";

const crons = cronJobs();

crons.cron("Event Tasks", "*/5 * * * *", api.tasks.eventTasks.main);

export default crons;
