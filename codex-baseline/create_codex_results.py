"""
create_codex_results.py
Data postprocessing results to construct the Codex output data.
"""
import argparse
import csv
import os
from collections import defaultdict

parser = argparse.ArgumentParser()
parser.add_argument(
    "--stimuli",
    type=str,
    default="prompting/data/stimuli_v1.csv",
    help="Filepath to stimuli.",
)
parser.add_argument(
    "--outputs",
    nargs="+",
    type=str,
    default=[
        "codex-baseline/probsem/outputs/codex_baseline_v1_zeroshot_code-davinci-002_results.csv"
    ],
)
parser.add_argument(
    "--output_dir",
    type=str,
    default="codex-baseline",
    help="Where to write the outputs.",
)


def load_stimuli(args):
    with open(args.stimuli) as f:
        reader = csv.DictReader(f)
        return {s["language_full"].strip(): int(s["task_id"]) for s in reader}


def get_language_full(codex_prompt):
    # Recovers the stimulus from the full language.
    return (
        codex_prompt.split("Scenario: Imagine there is a table. ")[-1]
        .split("If")[0]
        .strip()
    )


def get_likert_value(nl_prompt):
    # Recovers scalar likert from likert answer
    return int(nl_prompt.split("Answer: ")[-1].split()[0].strip())


def postprocess_outputs(stimuli, args):
    for output in args.outputs:
        outputs = {}
        with open(output) as f:
            reader = csv.DictReader(f)
            for s in reader:
                language = get_language_full(s["text"])
                likert_scale = get_likert_value(s["query"])
                score = float(s["score"])
                task_id = stimuli[language]
                if task_id not in outputs:
                    outputs[task_id] = {
                        "task_id": task_id,
                        "probs": [0.0] * 7,
                        "support": list(range(1, 8)),
                    }
                outputs[task_id]["probs"][likert_scale - 1] = score
        # Write out the outputs.
        output_filename = os.path.join(args.output_dir, output.split("/")[-1])
        with open(output_filename, "w") as f:
            fieldnames = ["task_id", "probs", "runtime", "support"]
            writer = csv.DictWriter(f, fieldnames=fieldnames)

            writer.writeheader()
            for task_id in range(len(outputs)):
                writer.writerow(outputs[task_id + 1])


def main():
    args = parser.parse_args()
    stimuli = load_stimuli(args)
    postprocess_outputs(stimuli, args)


if __name__ == "__main__":
    main()
