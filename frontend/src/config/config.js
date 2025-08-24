const config = {
  development: {
    apiUrl: 'http://localhost:5001',
  },
  production: {
    apiUrl: 'https://lead-management-system-1ta8.onrender.com',
  },
};

const environment = process.env.NODE_ENV || 'development';
const currentConfig = config[environment];

export const API_BASE_URL = currentConfig.apiUrl;
export default currentConfig;
