/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config: any, { isServer }: { isServer: boolean }) => {
    // Exclude test files from being processed
    config.module.rules.push({
      test: /\.test\.js$/,
      loader: "ignore-loader",
    });

    config.module.rules.push({
      test: /node_modules\/thread-stream\/test\//,
      loader: "ignore-loader",
    });

    // Externalize problematic packages
    config.externals.push("pino-pretty", "lokijs", "encoding");

    // Ignore test dependencies
    config.resolve.alias = {
      ...config.resolve.alias,
      tap: false,
      tape: false,
      "why-is-node-running": false,
    };

    return config;
  },
};

module.exports = nextConfig;
