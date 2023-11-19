type Logger = {
  log: (title: string, message: unknown) => void;
};

const logMessageDev = (title: string, message: unknown) => {
  console.log(`[${new Date().toTimeString()}]: ${title}`);
  console.log(message);
};

const logMessageProd = () => {};

export const devLogger: Logger = {
  log: process?.env?.NODE_ENV === 'development' ? logMessageDev : logMessageProd,
};
