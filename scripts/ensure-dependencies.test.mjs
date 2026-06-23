import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { dependenciesInstalled, ensureDependencies } from "./ensure-dependencies.mjs";

test("installs workspace dependencies in a fresh clone", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "onlybarber-deps-"));
  const calls = [];
  try {
    await ensureDependencies(root, async (command, args) => {
      calls.push([command, ...args]);
      await mkdir(path.join(root, "node_modules", "expo"), { recursive: true });
      await writeFile(path.join(root, "node_modules", "expo", "package.json"), "{}");
    });
    assert.deepEqual(calls, [["npm", "install"]]);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("does not reinstall when the local Expo dependency exists", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "onlybarber-deps-"));
  try {
    await mkdir(path.join(root, "node_modules", "expo"), { recursive: true });
    await writeFile(path.join(root, "node_modules", "expo", "package.json"), "{}");
    assert.equal(dependenciesInstalled(root), true);
    await ensureDependencies(root, async () => assert.fail("npm install should not run"));
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("Windows launcher ensures dependencies before building", async () => {
  const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
  const launcher = await readFile(path.join(root, "INICIAR_ONLY_BARBER.cmd"), "utf8");
  const ensurePosition = launcher.indexOf("node scripts\\ensure-dependencies.mjs");
  const buildPosition = launcher.indexOf("npm run build:web");
  assert.ok(ensurePosition >= 0, "launcher must ensure dependencies");
  assert.ok(buildPosition >= 0, "launcher must build the web app");
  assert.ok(ensurePosition < buildPosition, "dependencies must be installed before build");
});
