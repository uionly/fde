import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import { getAllCaseStudies } from "@/lib/content/loaders";

describe("Northstar case study", () => {
  it("contains ten ordered progressive problems", () => { const study = getAllCaseStudies()[0]; expect(study.slug).toBe("northstar"); expect(study.scenarios).toHaveLength(10); expect(study.scenarios.map((item) => item.order)).toEqual([1,2,3,4,5,6,7,8,9,10]); });
  it("marks every sample customer identity as synthetic", () => { const customers = JSON.parse(fs.readFileSync(path.join(process.cwd(), "content/datasets/northstar/customers.json"), "utf8")) as { name: string }[]; expect(customers.every((customer) => /Synthetic|Example|Fixture|Sample|Test|Demo/.test(customer.name))).toBe(true); });
});
