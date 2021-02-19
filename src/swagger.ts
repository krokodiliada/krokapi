export default {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "KrokAPI Documentation",
      version: "1.0.0",
      description: "REST API for orienting contests system.",
      license: {
        name: "MIT",
        url: "https://github.com/krokodiliada/krokapi/blob/main/LICENSE",
      },
      contact: {
        name: "KrokAPI",
        url: "https://github.com/krokodiliada/krokapi",
      },
    },
    servers: [
      {
        url: "http://localhost:8080/v1/",
        description: "KrokAPI server version 1.x",
      },
    ],
  },
  apis: ["./src/routes/**/*.ts"],
};
