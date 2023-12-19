import { Firebot } from "@crowbartools/firebot-custom-scripts-types";
import { autoload } from "./autoload";
import { EventSource } from "@crowbartools/firebot-custom-scripts-types/types/modules/event-manager";

interface Params {
  message: string;
}

const script: Firebot.CustomScript<Params> = {
  getScriptManifest: () => {
    return {
      name: "Starter Custom Script",
      description: "A starter custom script for build",
      author: "SomeDev",
      version: "1.0",
      firebotVersion: "5",
    };
  },
  getDefaultParameters: () => {
    return {
      message: {
        type: "string",
        default: "Hello World!",
        description: "Message",
        secondaryDescription: "Enter a message here",
      },
    };
  },
  run: (runRequest) => {
    const { logger } = runRequest.modules;
    logger.info(runRequest.parameters.message);
    const eventSource: EventSource = {
      id: "example",
      name: "Example",
      events: []
    };
    autoload(runRequest.modules, eventSource);
  },
};

export default script;
