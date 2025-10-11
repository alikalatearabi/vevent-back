#!/bin/bash

# Test with exact curl command that's failing
echo "Testing with exact same curl command that's failing..."
curl 'http://185.149.192.60:3001/api/v1/auth/login' \
  -v \
  -H 'Referer: http://0.0.0.0:3000/' \
  -H 'Origin: http://0.0.0.0:3000' \
  -H 'User-Agent: Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36' \
  -H 'accept: application/json' \
  -H 'content-type: application/json' \
  -c cookies.txt \
  --data-raw $'{"email":"john.doe@example.com","password":"Password123\u0021"}'

echo -e "\n\nCookies received:"
cat cookies.txt
