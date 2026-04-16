/**
 * Cloudflare Workers Queue Consumer & Cron Handlers.
 * This file is intended to be deployed as a separate Cloudflare Worker, 
 * or configured inside the OpenNext config for background processing.
 */

export interface Env {
  DB: D1Database;
  STORAGE: R2Bucket;
  CONTENT_QUEUE: Queue;
  MONITOR_QUEUE: Queue;
  PUBLISH_QUEUE: Queue;
}

export default {
  // Cron Trigger configuration
  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext) {
    const trigger = event.cron;

    if (trigger === "0 3 * * 1") {
      // Mondays at 3:00 UTC - Weekly Monitoring
      const campaigns = await env.DB.prepare(
        "SELECT * FROM campaigns WHERE status = 'active'"
      ).all();

      for (const campaign of campaigns.results) {
        await env.MONITOR_QUEUE.send({
          type: "weekly_monitor",
          campaign_id: campaign.id,
        });
      }
    }

    if (trigger === "0 4 1,15 * *") {
      // 1st and 15th of month at 4:00 UTC - Content Refresh Policy
      const staleArticles = await env.DB.prepare(\`
        SELECT a.*, c.name as company_name
        FROM articles a
        JOIN campaigns ca ON a.campaign_id = ca.id
        JOIN companies c ON ca.company_id = c.id
        WHERE a.status = 'published'
        AND a.updated_at < datetime('now', '-14 days')
      \`).all();

      for (const article of staleArticles.results) {
        await env.CONTENT_QUEUE.send({
          type: "freshness_refresh",
          article_id: article.id,
          reason: "Perplexity citation drop-off mitigation (14-day refresh)",
        });
      }
    }
  },

  // Queue Consumer binding
  async queue(batch: MessageBatch<any>, env: Env) {
    if (batch.queue === "content-generation") {
      for (const message of batch.messages) {
        console.log("Processing content generation task:", message.body);
        // Call content generation API logic from here internally
      }
    } else if (batch.queue === "monitoring") {
      for (const message of batch.messages) {
        console.log("Processing monitoring task:", message.body);
      }
    } else if (batch.queue === "publishing") {
      for (const message of batch.messages) {
        console.log("Processing publishing task:", message.body);
      }
    }
  }
};
