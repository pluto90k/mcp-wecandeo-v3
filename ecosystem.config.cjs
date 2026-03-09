module.exports = {
	apps: [
		{
			name: "mcp-wecandeo",
			script: "./dist/instance.js",
			instances: 1,
			autorestart: true,
			watch: false,
			max_memory_restart: "256M",
			env: {
				NODE_ENV: "production",
				PORT: 3000,
				// WECANDEO_ACCESS_KEY: "your-key-here"  // Set via environment or .env file
			},
			env_development: {
				NODE_ENV: "development",
				PORT: 3001,
			},
			log_date_format: "YYYY-MM-DD HH:mm:ss Z",
			error_file: "./logs/mcp-wecandeo-error.log",
			out_file: "./logs/mcp-wecandeo-out.log",
			merge_logs: true,
		},
	],
};
