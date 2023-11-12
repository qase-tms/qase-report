type Logger = {
  log: (title: string, message: any) => void;
};

const logMessageDev = (title: string, message: any) => {
  console.log(`[${new Date().toTimeString()}]: ${title}`);
  console.log(message);
};

const logMessageProd = (title: string, message: any) => {};

export const devLogger: Logger = {
  log: process?.env?.NODE_ENV === 'development' ? logMessageDev : logMessageProd,
};
