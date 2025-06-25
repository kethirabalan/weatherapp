const functions = require('firebase-functions');
const admin = require('firebase-admin');
const fetch = require('node-fetch');

admin.initializeApp();

const db = admin.firestore();
const OPENWEATHER_KEY = functions.config().openweather.key;

// Helper: Check for severe weather
function isSevereWeather(description) {
  return /rain|storm|snow|thunder|hail/i.test(description);
}

// Scheduled function: runs every hour
exports.sendSevereWeatherAlerts = functions.pubsub.schedule('every 60 minutes').onRun(async (context) => {
  const usersSnap = await db.collection('users').get();
  for (const userDoc of usersSnap.docs) {
    const user = userDoc.data();
    if (!user.settings?.notifications || !user.favorites || !user.fcmToken) continue;

    for (const city of user.favorites) {
      // Fetch weather for city
      const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${OPENWEATHER_KEY}`;
      const res = await fetch(url);
      if (!res.ok) continue;
      const data = await res.json();
      const description = data.weather?.[0]?.description || '';
      if (isSevereWeather(description)) {
        // Send notification
        await admin.messaging().send({
          token: user.fcmToken,
          notification: {
            title: `Severe Weather Alert for ${city}`,
            body: `Alert: ${description.charAt(0).toUpperCase() + description.slice(1)}`
          }
        });
      }
    }
  }
  return null;
});
