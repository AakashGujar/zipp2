declare module "@amplitude/ua-parser-js" {
  class UAParser {
    constructor(uastring?: string, extensions?: any[]);
    setUA(uastring: string): UAParser;
    getResult(): {
      ua: string;
      browser: {
        name?: string;
        version?: string;
        major?: string;
      };
      engine: {
        name?: string;
        version?: string;
      };
      os: {
        name?: string;
        version?: string;
      };
      device: {
        vendor?: string;
        model?: string;
        type?: string;
      };
      cpu: {
        architecture?: string;
      };
    };
    getBrowser(): {
      name?: string;
      version?: string;
    };
    getDevice(): {
      model?: string;
      type?: string;
      vendor?: string;
    };
    getEngine(): {
      name?: string;
      version?: string;
    };
    getOS(): {
      name?: string;
      version?: string;
    };
    getCPU(): {
      architecture?: string;
    };
    getUA(): string;
  }

  export default UAParser;
}

declare module "pg";
declare module "cookie-parser";
declare module "qrcode";
declare module "cors";
