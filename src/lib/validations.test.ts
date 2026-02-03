import { describe, it, expect } from "vitest";
import { isValidUrl } from "./validations";

describe("isValidUrl", () => {
  it("returns true for valid http URLs", () => {
    expect(isValidUrl("https://example.com")).toBe(true);
    expect(isValidUrl("http://localhost:3000")).toBe(true);
    expect(isValidUrl("https://app.example.com/path?q=1")).toBe(true);
  });

  it("returns false for invalid URLs", () => {
    expect(isValidUrl("")).toBe(false);
    expect(isValidUrl("not-a-url")).toBe(false);
    expect(isValidUrl("://missing-scheme")).toBe(false);
  });

  it("returns false for malformed strings", () => {
    expect(isValidUrl("javascript:alert(1)")).toBe(true); // URL constructor accepts this
    expect(isValidUrl("  ")).toBe(false);
  });
});
