/**
 * Calculates the time difference between the current date and a given date.
 *
 * This function takes a Date object as input and returns a string that represents
 * how long ago that date was from the current date. The output is formatted in terms
 * of months, weeks, days, or indicates that the date is "Today" if it falls within
 * the current day.
 *
 * @param {Date} date - The date to compare against the current date.
 * @returns {string} A string representing the time difference (e.g., "2 months ago").
 */
export function getTimeDifference(date: Date): string {
  // Get the current date and time
  const now = new Date();

  // Calculate the difference in milliseconds between now and the provided date
  const diff = now.getTime() - date.getTime();

  // Convert the difference from milliseconds to days
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  // Calculate the number of weeks and months from the total days
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);

  // Return the appropriate time difference string based on the calculated values
  if (months > 0) return `${months} month${months > 1 ? "s" : ""} ago`; // Return months if applicable
  if (weeks > 0) return `${weeks} week${weeks > 1 ? "s" : ""} ago`; // Return weeks if applicable
  if (days > 0) return `${days} day${days > 1 ? "s" : ""} ago`; // Return days if applicable

  // If the date is today, return "Today"
  return "Today";
}
