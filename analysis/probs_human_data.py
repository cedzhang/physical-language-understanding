import csv
from collections import defaultdict, Counter
import numpy as np

HUMAN_DATA = "analysis/human_data.csv"
human_data = defaultdict(lambda: Counter())
with open(HUMAN_DATA) as f:
    reader = csv.DictReader(f)
    for d in reader:
        human_data[int(float(d["task_id"]))][int(d["response"])] += 1

for task_id in range(len(human_data)):
    print(task_id + 1)
    # Normalize.
    likert_score = [human_data[task_id + 1][s] for s in range(1, 8)]
    likert_score_normed = [float(s) / np.sum(likert_score) for s in likert_score]
    print(likert_score_normed)
