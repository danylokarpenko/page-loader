export default ({ message, fileName, lineNumber }) => {
  throw new Error(message, fileName, lineNumber);
};
