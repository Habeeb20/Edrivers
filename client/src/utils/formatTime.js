// utils/formatTime.js — or inline in the component file

export const timeAgo = (dateInput) => {
  if (!dateInput) return '?';

  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return '?';

  const seconds = Math.floor((new Date() - date) / 1000);

  if (seconds < 0) return 'just now'; // guards against clock skew
  if (seconds < 60) return 'just now';

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min${minutes === 1 ? '' : 's'} ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} day${days === 1 ? '' : 's'} ago`;

  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks} week${weeks === 1 ? '' : 's'} ago`;

  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months === 1 ? '' : 's'} ago`;

  const years = Math.floor(days / 365);
  return `${years} year${years === 1 ? '' : 's'} ago`;
};

export const formatJoinDate = (dateInput) => {
  if (!dateInput) return '?';

  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return '?';

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};