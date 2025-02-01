import { useState, useEffect } from 'react';
import PrayTimes from 'praytimes'; // Import the library

const PrayerTimes = () => {
  const [prayerTimes, setPrayerTimes] = useState(null);

  useEffect(() => {
    // Check if geolocation is available
    if ('geolocation' in navigator)
      navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;
        const date = new Date();
        const prayTimes = new PrayTimes();

        // Set calculation method (e.g., Muslim World League, ISNA, Umm al-Qura)
        prayTimes.setMethod('MWL');

        // Get prayer times
        const times = prayTimes.getTimes(
          date,
          [latitude, longitude],
          'auto',
          '24h'
        );

        setPrayerTimes(times);
      });
  }, []);

  return (
    <div>
      <h2>Prayer Times</h2>
      {prayerTimes ? (
        <ul>
          {Object.entries(prayerTimes).map(([name, time]) => (
            <li key={name}>
              {name}: {time}
            </li>
          ))}
        </ul>
      ) : (
        <p>Loading prayer times...</p>
      )}
    </div>
  );
};

export default PrayerTimes;
