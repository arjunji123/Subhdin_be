import { beforeEach, describe, expect, it, vi } from "vitest";

import { createReviewHandler } from "../src/modules/vendor/reviews.controller.js";
import { createReview } from "../src/modules/vendor/reviews.service.js";

vi.mock("../src/modules/vendor/reviews.service.js", () => ({
  createReview: vi.fn(),
  listReviews: vi.fn(),
}));

describe("createReviewHandler", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("allows authenticated users to create a review for a specific vendor", async () => {
    vi.mocked(createReview).mockResolvedValue({
      id: "review-1",
      vendorId: "vendor-123",
      userName: "Ahmed",
      rating: 5,
      comment: "Great service",
      createdAt: "2026-06-25T00:00:00.000Z",
    } as never);

    const req = {
      auth: { userId: "user-123", role: "user" },
      body: {
        vendorId: "vendor-123",
        rating: 5,
        comment: "Great service",
      },
    } as any;

    const json = vi.fn();
    const status = vi.fn().mockReturnValue({ json });
    const res = { status } as any;

    await createReviewHandler(req, res);

    expect(createReview).toHaveBeenCalledWith("vendor-123", { rating: 5, comment: "Great service" }, undefined);
    expect(status).toHaveBeenCalledWith(201);
  });
});
