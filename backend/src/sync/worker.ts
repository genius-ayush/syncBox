// import { NestFactory } from "@nestjs/core";
// import { InjectModel } from "@nestjs/mongoose";
// import { Model } from "mongoose";
// import { ImapFlow } from "imapflow";
// import { AppModule } from "src/app.module";
// import { SyncJob } from "./schemas/sync-job.schema";

// async function bootstrapWorker() {
//   const app = await NestFactory.createApplicationContext(AppModule);
//   const syncModel = app.get<Model<SyncJob>>("SyncJobModel");

//   console.log("Worker started...");

//   setInterval(async () => {
//     const job = await syncModel.findOne({
//       status: { $in: ["pending", "running"] },
//     });

//     if (!job) return;

//     if (job.status === "paused") {
//       console.log(`Job ${job._id} paused...`);
//       return;
//     }
//     if (job.status === "stopped") {
//       console.log(`Job ${job._id} stopped.`);
//       return;
//     }

//     console.log(`Syncing job ${job._id}`);
//     job.status = "running";
//     await job.save();

//     try {
//       // 1️⃣ Fetch connection creds from DB
//       // (for now: hardcoded, but in real code you'd fetch from Connection collection)
//       const sourceClient = new ImapFlow({
//         host: "imap.gmail.com",
//         port: 993,
//         secure: true,
//         auth: { user: "source@gmail.com", pass: "sourcePassword" },
//       });

//       const destClient = new ImapFlow({
//         host: "imap.mail.yahoo.com",
//         port: 993,
//         secure: true,
//         auth: { user: "destination@yahoo.com", pass: "destinationPassword" },
//       });

//       await sourceClient.connect();
//       await destClient.connect();

//       // 2️⃣ Open INBOX on both
//       let lock = await sourceClient.getMailboxLock("INBOX");
//       let destLock = await destClient.getMailboxLock("INBOX");

//       try {
//         let count = 0;
//         let total = 0;

//         // Count messages in source
//         for await (let _ of sourceClient.fetch("1:*", { uid: true })) total++;
//         job.totalEmails = total;
//         await job.save();

//         for await (let message of sourceClient.fetch("1:*", {
//           envelope: true,
//           source: true, // get raw email source
//           flags: true,
//           internalDate: true,
//         })) {
//           // 🔍 Check status mid-way
//           const freshJob = await syncModel.findById(job._id);
//           if (freshJob.status === "paused" || freshJob.status === "stopped") {
//             console.log(`Job ${job._id} interrupted: ${freshJob.status}`);
//             break;
//           }

//           // 3️⃣ Append email to destination
//           await destClient.append("INBOX", message.source, {
//             flags: message.flags,
//             internalDate: message.internalDate,
//           });

//           console.log("Synced:", message.envelope.subject);
//           count++;

//           // 4️⃣ Update progress
//           freshJob.processedEmails = count;
//           freshJob.progress = Math.floor((count / total) * 100);
//           await freshJob.save();
//         }
//       } finally {
//         lock.release();
//         destLock.release();
//       }

//       await sourceClient.logout();
//       await destClient.logout();

//       job.status = "completed";
//       job.progress = 100;
//       await job.save();
//     } catch (err) {
//       console.error("Error syncing:", err);
//       job.status = "stopped";
//       await job.save();
//     }
//   }, 5000);
// }

// bootstrapWorker();
