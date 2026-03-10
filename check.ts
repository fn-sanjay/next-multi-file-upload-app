import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

async function run() {
  console.log("Fetching buckets...");
  const { data, error } = await supabase.storage.listBuckets();
  if (error) {
    console.error("Bucket list error:", error);
    process.exit(1);
  }

  const bucketNames = data.map((b) => b.name);
  console.log("Buckets:", bucketNames);

  if (!bucketNames.includes("uploads")) {
    console.log("Creating 'uploads' bucket...");
    await supabase.storage.createBucket("uploads", { public: false });
    console.log("Bucket created.");
  } else {
    console.log("'uploads' bucket already exists.");
  }

  console.log("Trying to upload a file...");
  const { data: upData, error: upError } = await supabase.storage
    .from("uploads")
    .upload("test.txt", "hello", { upsert: true });

  if (upError) {
    console.error("Upload error:", upError);
  } else {
    console.log("Upload success:", upData);
  }
}

run();
