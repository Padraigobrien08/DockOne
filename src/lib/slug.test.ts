import { describe, it, expect } from "vitest";
import { slugify } from "./slug";

describe("slugify", () => {
  it("lowercases and replaces spaces with dash", () => {
    expect(slugify("My App")).toBe("my-app");
    expect(slugify("Hello World")).toBe("hello-world");
  });

  it("replaces slashes with dash", () => {
    expect(slugify("foo/bar")).toBe("foo-bar");
  });

  it("strips non-alphanumeric except dash", () => {
    expect(slugify("What's New?")).toBe("whats-new");
    expect(slugify("Test!@#")).toBe("test");
  });

  it("collapses multiple dashes", () => {
    expect(slugify("a   b")).toBe("a-b");
    expect(slugify("hello---world")).toBe("hello-world");
  });

  it("trims leading and trailing dashes", () => {
    expect(slugify("  hello  ")).toBe("hello");
    expect(slugify("-hello-")).toBe("hello");
  });

  it("returns 'app' for empty or only non-alphanumeric", () => {
    expect(slugify("")).toBe("app");
    expect(slugify("   ")).toBe("app");
    expect(slugify("---")).toBe("app");
    expect(slugify("!@#")).toBe("app");
  });

  it("keeps alphanumeric and dashes", () => {
    expect(slugify("App123")).toBe("app123");
    expect(slugify("my-cool-app")).toBe("my-cool-app");
  });
});
