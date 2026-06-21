import { runSeed } from "./seed-runner";

runSeed()
  .then(() => {
    console.log("Seed complete!");
    console.log("Login: admin@example.com / admin123");
  })
  .catch(console.error);
