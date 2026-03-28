# 미니 유튜브

항상 화면 위에 떠 있는 귀여운 미니 유튜브 뷰어입니다.

작업하면서 영상 틀어놓고 싶을 때, 작고 귀여운 창으로 유튜브를 볼 수 있어요!

## 주요 기능

- **9가지 귀여운 스킨** — 개구리, 토끼, 곰, 공룡, 러브병, 노트북, 발레코어, 데빌캣, 체리케이크
- **항상 위 고정** — 다른 창 위에 항상 떠 있어요
- **투명도 조절** — 슬라이더로 창 투명도를 조절할 수 있어요
- **깔끔 모드** — 우클릭하면 스킨 없이 영상만 보는 모드
- **YouTube 검색 & 재생** — URL 입력 또는 YouTube 홈에서 바로 검색
- **YouTube 로그인** — 내 계정으로 로그인해서 구독 영상도 볼 수 있어요
- **드래그 이동 & 크기 조절** — 원하는 위치에, 원하는 크기로

## 다운로드(윈도우용)

[Releases](../../releases) 페이지에서 최신 버전을 다운로드할 수 있어요.

- **설치형**: `미니 유튜브 Setup x.x.x.exe` — 설치 후 바로가기 생성
- **포터블**: `미니 유튜브 x.x.x.exe` — 설치 없이 바로 실행

## 직접 빌드하기

소스코드에서 직접 빌드하고 싶다면 아래 가이드를 따라하세요.

### 사전 준비

**Node.js**가 필요합니다.

1. [nodejs.org](https://nodejs.org) 접속
2. **LTS** 버전 다운로드 및 설치

### 프로젝트 다운로드

터미널(맥) 또는 명령 프롬프트(윈도우)를 열고:

```bash
git clone https://github.com/renamerdis-wq/mini-youtube.git
cd mini-youtube
npm install
```

> `git`이 없다면 GitHub에서 **Code > Download ZIP**으로 받아서 압축 해제해도 됩니다.

### Windows에서 빌드

```bash
npx electron-builder --win
```

빌드가 완료되면 `dist/` 폴더에 파일이 생성됩니다:
- `미니 유튜브 Setup x.x.x.exe` (설치형)
- `미니 유튜브 x.x.x.exe` (포터블)

> 아이콘이 기본 아이콘으로 나올 경우, 빌드 후 아래 명령어로 아이콘을 패치하세요:
> ```bash
> node -e "const { rcedit } = require('rcedit'); rcedit('dist/win-unpacked/미니 유튜브.exe', { icon: 'build/r-icon.ico' }).then(() => console.log('Done'))"
> npx electron-builder --win --prepackaged dist/win-unpacked
> ```

### macOS에서 빌드

```bash
npx electron-builder --mac
```

빌드가 완료되면 `dist/` 폴더에 `.dmg` 파일 또는 `mac-arm64/` (Apple Silicon) / `mac/` (Intel) 폴더가 생성됩니다.

앱을 Applications에 넣으려면:
```bash
cp -r "dist/mac-arm64/미니 유튜브.app" /Applications/
```

### 개발 모드로 실행

빌드 없이 바로 실행해보고 싶다면:

```bash
npm start
```

## 사용법

1. 실행하면 귀여운 스킨이 씌워진 작은 창이 뜹니다
2. 설정(톱니바퀴) 버튼을 눌러 YouTube URL을 입력하거나, YouTube 홈 버튼으로 이동
3. 스킨, 투명도, 크기를 원하는 대로 조절
4. 우클릭하면 깔끔 모드 (스킨 없이 영상만)
5. 다시 우클릭하면 원래 모드로 복귀

## 라이선스

Copyright (c) R
