import { httpRouter } from "convex/server";
import { internal } from "./_generated/api";
import { httpAction } from "./_generated/server";
import { Paddle } from "@paddle/paddle-node-sdk";
import { ConvexError } from "convex/values";
import { handleError } from "./errors/handleError";

const paddle = new Paddle(process.env.PADDLE_API_KEY!);

const http = httpRouter();

http.route({
  path: "/api/paddle/webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const signature = request.headers.get("Paddle-Signature");
      const rawRequestBody = await request.text();
      const secretKey = process.env.PADDLE_WEBHOOK_SECRET_KEY;

      if (signature && rawRequestBody && secretKey) {
        const eventData = (await paddle.webhooks.unmarshal(rawRequestBody, secretKey, signature)) as any;

        if (eventData.eventType === "transaction.completed") {
          const status = eventData.data.status;
          const customerId = eventData.data.customerId;
          const priceId = eventData.data.items[0].price.id;

          // if the customData is not present, it means its recurring subscription payment
          const email = eventData.data.customData.email;
          const walletAddress = eventData.data.customData.walletAddress;

          if (status === "completed" && customerId && priceId) {
            await ctx.runMutation(internal.users.subscribeToPaddlePlan, {
              paddle_customer_id: customerId,
              paddle_price_id: priceId,
              email: email,
              walletAddress: walletAddress,
            });
          }
        }
      } else {
        throw new ConvexError("!(signature && rawRequestBody && secretKey)");
      }

      return Response.json({ ok: true });
    } catch (error) {
      await handleError({ where: "/api/paddle/webhook", error });
      return Response.json({ ok: false }, { status: 500 });
    }
  }),
});

export default http;
