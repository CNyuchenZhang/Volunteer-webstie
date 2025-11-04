import http from 'k6/http';
import { sleep } from 'k6';

export const options = {
  vus: 20,
  duration: '1m',
  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<300']
  }
};

export default function () {
  http.get('http://localhost:8002/api/v1/health/');
  sleep(1);
}

