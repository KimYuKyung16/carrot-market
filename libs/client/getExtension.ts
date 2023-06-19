export default function getFileNameAndExtension(filename: string) {
  let fileLen = filename.length;
  let lastDot = filename.lastIndexOf('.');
  let fileExtenstion = filename.substring(lastDot, fileLen);
  filename = filename.substring(0, lastDot);

  return {filename, fileExtenstion};
}
