export default function formatTimestamp(time: number) {
  const zeroFormatter = new Intl.NumberFormat(undefined, {
    minimumIntegerDigits: 2,
  });
  const seconds = Math.floor(time % 60);
  const minutes = Math.floor(time / 60) % 60;
  const hours = Math.floor(time / 3600);

  if (hours === 0) {
    return `${minutes}:${zeroFormatter.format(seconds)}`;
  } else {
    return `${hours}:${zeroFormatter.format(minutes)}:${zeroFormatter.format(
      seconds,
    )}`;
  }
}
