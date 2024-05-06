import CopyPlugin from 'copy-webpack-plugin';
/** @type {import('next').NextConfig} */
const nextConfig = {
    webpack: (
        config,
        { buildId, dev, isServer, defaultLoaders, nextRuntime, webpack }
    ) => {
        const newCopy = new CopyPlugin({
            patterns: [
                {
                    from: './node_modules/webappalyzer-js/categories.json',
                    to: './server/vendor-chunks/categories.json',
                },
                {
                    from: './node_modules/webappalyzer-js/technologies',
                    to: './server/vendor-chunks/technologies',
                },
                {
                    from: './node_modules/webappalyzer-js/categories.json',
                    to: './server/chunks/categories.json',
                },
                {
                    from: './node_modules/webappalyzer-js/technologies',
                    to: './server/chunks/technologies',
                },
            ],
        });
        config.plugins.push(newCopy);
        // Important: return the modified config
        return config
    },
};

export default nextConfig;
