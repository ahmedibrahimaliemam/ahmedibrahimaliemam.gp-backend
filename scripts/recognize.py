# recognize.py
import sys
import json
import base64
import numpy as np
import face_recognition
import cv2

# 1) Load known encodings & IDs from your NPZ
data = np.load("../face_encodings.npz", allow_pickle=True)
known_ids = data["ids"].tolist()             # e.g. array of ["player1","player2",...]
known_encodings = data["encodings"]           # e.g. shape (N, 128)

# 2) Read base64 image from stdin
raw = sys.stdin.read()
payload = json.loads(raw)
b64 = payload["image"].split(",")[1]
img_data = base64.b64decode(b64)
nparr = np.frombuffer(img_data, np.uint8)
img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)

# 3) Find faces & encodings
face_locs = face_recognition.face_locations(rgb)
face_encs = face_recognition.face_encodings(rgb, face_locs)

recognized = []
for enc in face_encs:
    # compare to known; use a tolerance you prefer (default 0.6)
    matches = face_recognition.compare_faces(known_encodings, enc, tolerance=0.6)
    if True in matches:
        idx = matches.index(True)
        recognized.append(known_ids[idx])

# 4) Print JSON result
print(json.dumps({"recognizedIds": recognized}))
