## 일기 작성
<p align="center">
  <img src="https://github.com/KimYuKyung16/diary/assets/81006438/d70dc57e-6b3b-4dc2-a43a-fd9c4a677d78" />
</p>
<hr color="FF8E3D"/>

# 당근 마켓(클론 코딩)
사람들이 당근마켓 사이트에서 채팅을 주고받으며 중고거래를 할 수 있고,
라이브 스트리밍을 통해서 물건을 판매할 수 있는 홈페이지

<br/>

## 배포주소
---
https://carrot-market-rh3l.vercel.app/


## :information_desk_person: 프로젝트 설명
---
1. 팔고 싶은 제품을 등록할 수 있습니다.

2. 동네 사람들의 커뮤니티 글을 확인할 수 있습니다.

3. 판매자와의 채팅을 통해 제품 거래를 할 수 있습니다.

4. 라이브 스트리밍을 통해 제품을 판매할 수 있습니다.

<br/>

<div align="center">
  <p weight="bold">✨Tech Stack✨</p>
  <img src="https://img.shields.io/badge/Next.js-000000?style=flat&logo=Next.js&logoColor=white"/>
  <img src="https://img.shields.io/badge/Tailwind CSS-06B6D4?style=flat&logo=tailwindcss&logoColor=white"/>
  <img src="https://img.shields.io/badge/Prisma-2D3748?style=flat&logo=prisma&logoColor=white"/>
  <img src="https://img.shields.io/badge/Cloudflare-F38020?style=flat&logo=cloudflare&logoColor=white"/>

  <img src="https://img.shields.io/badge/Node.js-339933?style=flat&logo=Node.js&logoColor=white"/>
  <img src="https://img.shields.io/badge/Amazon EC2-FF9900?style=flat&logo=amazonec2&logoColor=white"/>
  <img src="https://img.shields.io/badge/Amazon S3-569A31?style=flat&logo=amazons3&logoColor=white"/>
</div>


## :key: 기술 사용 이유
---
1. 당근마켓 같은 경우에는 물건을 판매하는 사이트기 때문에 사람들이 해당 게시글을 많이 볼 수록 물건을 판매할 수 있는 확률이 높습니다. 따라서 검색 엔진을 최적화하기 위해서 Nextjs를 사용했습니다. 

2. 처음에는 Nextjs만을 이용해서 프로젝트를 진행하려고 했지만 socket으로 채팅을 구현한 후 vercel에서 배포할 때 문제가 있었습니다. 따라서 socketio를 사용하기 위해 nodejs를 이용해 서버 하나를 더 생성했습니다. 


## :page_with_curl: 화면 구성
---
<img src="https://github.com/KimYuKyung16/carrot_market/assets/81006438/17bedb02-5218-456d-b111-5f108055fe04"/>

> `로그인`: 회원가입 후 이메일 혹은 전화번호를 통해 로그인할 수 있습니다.

<img src="https://github.com/KimYuKyung16/carrot_market/assets/81006438/302f6396-abbc-48f3-a7cc-7a7d8b8056d6"/>

> `홈`: 판매중인 상품 리스트를 확인할 수 있습니다.

<img src="https://github.com/KimYuKyung16/carrot_market/assets/81006438/a4a29ea9-6242-496b-b688-6e1adae80629"/>

> `동네생활`: 질문글을 남기고 확인하는 것이 가능하며 답글을 남길 수 있습니다.

<img src="https://github.com/KimYuKyung16/carrot_market/assets/81006438/1970ac44-e20b-4353-926d-3e6e36ef173e"/>

> `채팅`: 판매자들과의 채팅이 가능합니다.

<img src="https://github.com/KimYuKyung16/carrot_market/assets/81006438/e7953389-7983-4a77-9acc-e556dbed4042"/>

> `거래`: 판매자에게만 있는 거래버튼을 눌러 거래를 진행할 수 있습니다. 구매자는 해당 판매에 대한 후기를 남길 수 있습니다.

<img src="https://github.com/KimYuKyung16/carrot_market/assets/81006438/d7dbf45b-989b-4f47-9a46-bf7a54e4c272"/>

> `채팅 거래`: 라이브 스트리밍을 통해 물건을 판매할 수 있고, 시청자들도 스트리밍을 보면서 채팅을 남길 수 있습니다.


## :bulb: 추후 추가/수정할 기능 
1. 위치의 정확도 높이기 
2. 비슷한 상품을 찾아내는 더 좋은 알고리즘 찾기 


