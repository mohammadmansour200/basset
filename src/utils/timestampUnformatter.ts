export default function unformatTimestamp(duration: string) {
  const splittedDuration = duration.split(":");

  const hours = splittedDuration.length === 2 ? undefined : splittedDuration[0];
  const minutes =
    hours === undefined ? splittedDuration[0] : splittedDuration[1];
  const seconds =
    hours === undefined ? splittedDuration[1] : splittedDuration[2];
  if (hours === undefined && minutes === "0") {
    return parseInt(seconds);
  } else if (minutes !== undefined && hours === undefined) {
    const calcSeconds = parseInt(minutes) * 60 + parseInt(seconds);
    return calcSeconds;
  } else if (hours !== undefined) {
    const calcSeconds =
      parseInt(hours) * 3600 + parseInt(minutes) * 60 + parseInt(seconds);
    return calcSeconds;
  }
}
