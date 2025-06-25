const { onSchedule } = require("firebase-functions/v2/scheduler");
const admin = require("firebase-admin");

admin.initializeApp();

exports.deleteUnverifiedUsers = onSchedule({
  schedule: "every 5 minutes",
  timeZone: "UTC"
}, async (context) => {
  const now = Date.now();
  const fiveMinutesAgo = now - 5 * 60 * 1000;
  
  console.log(`Starting deletion process. Current time: ${new Date(now)}, Five minutes ago: ${new Date(fiveMinutesAgo)}`);
  
  try {
    let nextPageToken;
    do {
      const result = await admin.auth().listUsers(1000, nextPageToken);
      
      console.log(`Processing batch of ${result.users.length} users`);
      
      const deletions = result.users
        .filter(user => {
          const creationTime = new Date(user.metadata.creationTime).getTime();
          const shouldDelete = !user.emailVerified && creationTime < fiveMinutesAgo;
          
          console.log(`User ${user.email || user.uid}: created at ${new Date(creationTime)}, verified: ${user.emailVerified}, should delete: ${shouldDelete}`);
          
          return shouldDelete;
        })
        .map(user => admin.auth().deleteUser(user.uid));
      
      if (deletions.length > 0) {
        console.log(`Deleting ${deletions.length} unverified users`);
        await Promise.all(deletions);
      } else {
        console.log('No users to delete in this batch');
      }
      
      nextPageToken = result.pageToken;
    } while (nextPageToken);
    
    console.log("Unverified users older than 5 minutes deleted.");
  } catch (error) {
    console.error("Error deleting users:", error);
  }
});