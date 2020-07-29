const { padNumber } = require('./functions.js');

function dateTime(date = new Date()){
  return `${date.getFullYear()}-${padNumber(date.getMonth() + 1)}-${padNumber(date.getDate())} ${padNumber(date.getHours())}:${padNumber(date.getMinutes())}:${padNumber(date.getSeconds())}`;
}

function log(...args){
  console.log(`\x1b[1m\x1b[37m[log][${dateTime()}]\x1b[0m`, ...args);
}

function info(...args){
  console.info(`\x1b[1m\x1b[36m[info][${dateTime()}]\x1b[0m`, ...args);
}

function debug(...args){
  console.debug(`\x1b[1m\x1b[34m[debug][${dateTime()}]\x1b[0m`, ...args);
}

function warn(...args){
  console.warn(`\x1b[1m\x1b[33m[warning][${dateTime()}]\x1b[0m`, ...args);
}

function error(...args){
  if (typeof args[args.length - 1] == 'object') args = [...args, ...error_object(args.pop())];
  console.error(`\x1b[1m\x1b[31m[error][${dateTime()}]\x1b[0m`, ...args);
}

function error_object(error){
  const err_obj = [];
  if (error.message) err_obj.push(`\n\tMessage: ${error.message}`);
  if (error.errno) err_obj.push(`\n\tError No: ${error.errno}`);
  if (error.code) err_obj.push(`\n\tCode: ${error.code}`);
  return err_obj;
}

module.exports = {
  dateTime,
  log,
  info,
  debug,
  warn,
  error,
};
