import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Only initialize if environment variables are present
const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

let ratelimit: Ratelimit | null = null;

if (redisUrl && redisToken) {
    const redis = new Redis({
        url: redisUrl,
        token: redisToken,
    });

    // Create a new ratelimiter, that allows 10 requests per 10 seconds
    ratelimit = new Ratelimit({
        redis: redis,
        limiter: Ratelimit.slidingWindow(10, "10 s"),
        analytics: true,
    });
}

export async function checkRateLimit(identifier: string) {
    if (process.env.NODE_ENV === 'development') {
        return { success: true };
    }

    if (!ratelimit) {
        // If not configured, allow all (or you could reject for security)
        console.warn("Ratelimit not configured. Allowing request for:", identifier);
        return { success: true };
    }

    return await ratelimit.limit(identifier);
}
