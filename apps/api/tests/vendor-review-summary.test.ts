import { beforeAll, describe, expect, it, vi } from "vitest";

vi.mock("../src/lib/supabase.js", () => ({
  supabase: {},
}));

beforeAll(() => {
  process.env.NODE_ENV = "test";
  process.env.SUPABASE_URL = "https://example.supabase.co";
  process.env.SUPABASE_SERVICE_ROLE_KEY = "test-key";
  process.env.JWT_SECRET = "test-secret-should-be-long-enough";
  process.env.TWILIO_ACCOUNT_SID = "ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx";
  process.env.TWILIO_AUTH_TOKEN = "test-token";
  process.env.TWILIO_PHONE_NUMBER = "+15005550006";
});

describe("buildReviewSummary", () => {
  it("computes average rating and star breakdown from reviews", async () => {
    const { buildReviewSummary } = await import("../src/modules/vendor/vendor.service.js");
    const summary = buildReviewSummary([
      { rating: 5 },
      { rating: 4 },
      { rating: 5 },
      { rating: 2 },
    ] as Array<{ rating?: number | string | null }>);

    expect(summary).toEqual({
      averageRating: 4.0,
      reviewCount: 4,
      ratingBreakdown: {
        1: 0,
        2: 1,
        3: 0,
        4: 1,
        5: 2,
      },
    });
  });
});
