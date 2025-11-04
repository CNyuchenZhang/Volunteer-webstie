import http from 'k6/http';
import { sleep } from 'k6';

export const options = {
  stages: [
    { duration: '2m', target: 200 },
    { duration: '5m', target: 500 },
    { duration: '3m', target: 0 }
  ],
  thresholds: {
    http_req_failed: ['rate<0.005'],
    http_req_duration: ['p(95)<200']
  }
};

export default function () {
  http.get('http://localhost:8002/api/v1/activities/');
  sleep(1);
}

