import assert from "node:assert/strict";
import test from "node:test";
import { resolveStaticPath } from "./serve-build.mjs";

test("maps app routes to exported html files", () => {
  assert.equal(resolveStaticPath("/", "C:/dist"), "C:/dist/index.html");
  assert.equal(resolveStaticPath("/home", "C:/dist"), "C:/dist/home.html");
  assert.equal(resolveStaticPath("/studio/new", "C:/dist"), "C:/dist/studio/new.html");
  assert.equal(resolveStaticPath("/course/course_1", "C:/dist"), "C:/dist/course/[id].html");
  assert.equal(resolveStaticPath("/learn/course_1", "C:/dist"), "C:/dist/learn/[id].html");
});

test("rejects traversal outside the build directory", () => {
  assert.equal(resolveStaticPath("/../../secret", "C:/dist"), "C:/dist/+not-found.html");
});
