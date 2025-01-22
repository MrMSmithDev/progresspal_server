/* eslint-disable no-undef */
const { createCacheKey } = require("../../lib/cacheUtils");

describe("createCacheKey", () => {
  it("should generate a cache key with the correct format", () => {
    const prefix = "user";
    const params = { id: 123, name: "JohnDoe" };
    const result = createCacheKey(prefix, params);
    expect(result).toBe("user-123-JohnDoe");
  });

  it("should handle an empty params object", () => {
    const prefix = "empty";
    const params = {};
    const result = createCacheKey(prefix, params);
    expect(result).toBe("empty-");
  });

  it("should handle params with a single key", () => {
    const prefix = "single";
    const params = { id: 456 };
    const result = createCacheKey(prefix, params);
    expect(result).toBe("single-456");
  });

  it("should handle non-string values in params", () => {
    const prefix = "mixed";
    const params = { id: 789, active: true, count: 42 };
    const result = createCacheKey(prefix, params);
    expect(result).toBe("mixed-789-true-42");
  });

  it("should handle special characters in params", () => {
    const prefix = "special";
    const params = { id: "a!@#$", key: "b%^&*" };
    const result = createCacheKey(prefix, params);
    expect(result).toBe("special-a!@#$-b%^&*");
  });

  it("should throw an error if params is null or undefined", () => {
    const prefix = "null-test";
    expect(() => createCacheKey(prefix, null)).toThrow();
    expect(() => createCacheKey(prefix, undefined)).toThrow();
  });

  it("should throw an error if prefix is missing", () => {
    const params = { id: 123 };
    expect(() => createCacheKey(undefined, params)).toThrow();
    expect(() => createCacheKey(null, params)).toThrow();
  });
});
