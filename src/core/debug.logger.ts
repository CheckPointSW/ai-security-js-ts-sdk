import debug from 'debug';

const infoLog = debug('chkp_ai_security_sdk:info');
const errorLog = debug('chkp_ai_security_sdk:error');
const networkLog_ = debug('chkp_ai_security_sdk:network');

export const logger = (msg: string): void => { infoLog(msg); };
export const errorLogger = (msg: string): void => { errorLog(msg); };
export const networkLogger = (msg: string): void => { networkLog_(msg); };
