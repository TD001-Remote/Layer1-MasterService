import sys, os

with open('src/contexts/DataContext.tsx', 'rb') as f:
    d = f.read()

targets = [
    b'DCTArchiveRecord,',
    b'nonEntityApi, taxonomyApi',
    b'showToast: (type:',
    b'registryNonEntities] = useState',
    b'setNonEntities(nonEntitiesData)',
    b'// NEW: Registry methods',
    b'showToast,\n   };',
]
for t in targets:
    idx = d.find(t)
    sys.stdout.write(f'{repr(t)}: pos={idx}\n')
    if idx >= 0:
        sys.stdout.write(f'  ctx: {repr(d[idx:idx+80])}\n')

sys.stdout.flush()
