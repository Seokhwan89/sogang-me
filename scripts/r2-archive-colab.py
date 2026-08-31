# 서강대 기계공학과 홈페이지 — R2 legacy 미디어 1회 스냅샷 → 구글드라이브
#
# 사용법: 학과 Gmail로 https://colab.research.google.com 접속 → 새 노트북 →
#         이 파일 내용 전체를 셀 하나에 붙여넣고 실행(▶) → 드라이브 접근 허용.
# 결과:  내 드라이브에 `sogang-me-r2-backup_YYYY-MM-DD.tar` (약 1.3GB) 생성.
#        끝나면 그 파일을 학과 백업 폴더로 드래그해 옮기면 된다.
# 복원:  tar 파일을 풀면 legacy/... 경로 그대로 나온다. 새 저장소에 그대로 업로드하고
#        DB의 URL 접두어만 바꾸면 복원 완료 (scripts/ 폴더의 이전 기록 참조).

import json, os, tarfile, urllib.request, datetime
from concurrent.futures import ThreadPoolExecutor

PUB = 'https://pub-752d1dfed9d84e0f957284985c30f806.r2.dev/'
INV = 'https://raw.githubusercontent.com/sgmeoffice-hub/sogang-me/main/scripts/r2-inventory.json'
from urllib.parse import quote

from google.colab import drive  # type: ignore
drive.mount('/content/drive')

inv = json.loads(urllib.request.urlopen(INV).read())
print(f'대상: {len(inv)}개, {sum(s for _, s in inv)/1e9:.2f} GB')

os.makedirs('/content/r2', exist_ok=True)

def fetch(item):
    key, size = item
    path = '/content/r2/' + key
    if os.path.exists(path) and os.path.getsize(path) == size:
        return None
    os.makedirs(os.path.dirname(path), exist_ok=True)
    req = urllib.request.Request(PUB + quote(key), headers={'User-Agent': 'Mozilla/5.0'})
    data = urllib.request.urlopen(req, timeout=120).read()
    if len(data) != size:
        return f'{key}: 크기 불일치 {len(data)} != {size}'
    open(path, 'wb').write(data)
    return None

errors = []
done = 0
with ThreadPoolExecutor(max_workers=12) as ex:
    for i, err in enumerate(ex.map(fetch, inv), 1):
        if err: errors.append(err)
        if i % 300 == 0: print(f'{i}/{len(inv)}')

print(f'다운로드 완료, 오류 {len(errors)}건')
for e in errors[:10]: print(' ', e)
assert not errors, '오류가 있습니다. 셀을 다시 실행하면 이어받습니다.'

stamp = datetime.date.today().isoformat()
out = f'/content/drive/MyDrive/sogang-me-r2-backup_{stamp}.tar'
with tarfile.open(out, 'w') as tar:
    tar.add('/content/r2', arcname='.')
print('완료:', out, f'{os.path.getsize(out)/1e9:.2f} GB')
print('→ 내 드라이브에서 이 파일을 학과 백업 폴더로 옮기세요.')
