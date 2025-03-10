import axios, { InternalAxiosRequestConfig } from 'axios';


const $host = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'skip_zrok_interstitial': 'true'
  }
});

// Add the ngrok header to $host
// $host.defaults.headers.common['ngrok-skip-browser-warning'] = 'true';

const $authHost = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'skip_zrok_interstitial': 'true'
  }
});

// Add the ngrok header to $authHost
// $authHost.defaults.headers.common['ngrok-skip-browser-warning'] = 'true';

const authInterceptor = (config: InternalAxiosRequestConfig) => {
  config.headers.authorization = `Bearer ${localStorage.getItem('token')}`;
  return config;
};

$authHost.interceptors.request.use(authInterceptor);


export {
  $host,
  $authHost
};
