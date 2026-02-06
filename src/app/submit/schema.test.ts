import { describe, it, expect } from "vitest";
import { submitFullSchema } from "./schema";

describe("submitFullSchema", () => {
  it("accepts valid basics", () => {
    const result = submitFullSchema.safeParse({
      name: "My App",
      tagline: "A tool",
      app_url: "https://example.com",
      repo_url: "",
      tags: "react, tool",
      description: "",
      byok_required: false,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe("My App");
      expect(result.data.tags).toEqual(["react", "tool"]);
    }
  });

  it("rejects missing name", () => {
    const result = submitFullSchema.safeParse({
      name: "",
      app_url: "https://example.com",
      tags: undefined,
      byok_required: false,
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid app_url", () => {
    const result = submitFullSchema.safeParse({
      name: "App",
      app_url: "not-a-url",
      tags: undefined,
      byok_required: false,
    });
    expect(result.success).toBe(false);
  });

  it("rejects too many tags", () => {
    const result = submitFullSchema.safeParse({
      name: "App",
      app_url: "https://example.com",
      tags: "a,b,c,d,e,f,g,h,i,j,k",
      byok_required: false,
    });
    expect(result.success).toBe(false);
  });

  it("transforms tags string to array", () => {
    const result = submitFullSchema.safeParse({
      name: "App",
      app_url: "https://example.com",
      tags: "  FOO  ,  bar  ",
      byok_required: false,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.tags).toEqual(["foo", "bar"]);
    }
  });

  it("defaults lifecycle to wip and accepts lifecycle values", () => {
    const without = submitFullSchema.safeParse({
      name: "App",
      app_url: "https://example.com",
      tags: undefined,
      byok_required: false,
    });
    expect(without.success).toBe(true);
    if (without.success) expect(without.data.lifecycle).toBe("wip");

    const withLifecycle = submitFullSchema.safeParse({
      name: "App",
      app_url: "https://example.com",
      tags: undefined,
      byok_required: false,
      lifecycle: "looking_for_feedback",
    });
    expect(withLifecycle.success).toBe(true);
    if (withLifecycle.success) expect(withLifecycle.data.lifecycle).toBe("looking_for_feedback");
  });
});
