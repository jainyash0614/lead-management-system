const config = {
  development: {
    apiUrl: 'http://localhost:5001',
  },
  production: {
    apiUrl: 'https://your-backend-name.onrender.com', // Replace with your actual Render URL
  },
};

const environment = process.env.NODE_ENV || 'development';
const currentConfig = config[environment];

export const API_BASE_URL = currentConfig.apiUrl;
export default currentConfig;
