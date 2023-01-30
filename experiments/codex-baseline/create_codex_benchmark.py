"""
create_codex_benchmark.py 

Data preprocessing script to construct the Codex baseline data.
"""
import argparse
import json
import csv

parser = argparse.ArgumentParser()
parser.add_argument(
    "--header",
    type=str,
    default="data/header.txt",
    help="Filepath to header that will be prepended to all stimuli.",
)
parser.add_argument(
    "--stimuli",
    type=str,
    default="prompting/data/stimuli_v1.csv",
    help="Filepath to stimuli.",
)
parser.add_argument(
    "--choices", type=str, default="data/choices.txt", help="Filepath to stimuli.",
)
parser.add_argument(
    "--query", type=str, default="data/query.txt", help="Filepath to stimuli.",
)
parser.add_argument(
    "--output",
    type=str,
    default="experiments/codex-baseline/probsem/inputs/codex_baseline_v1.json",
    help="Filepath to output.",
)


def load_stimuli(args):
    with open(args.stimuli) as f:
        reader = csv.DictReader(f)
        return [s["language_full"] for s in reader]


def construct_probsem_benchmark(stimuli, args):
    with open(args.header) as f:
        header_text = f.read()

    with open(args.query) as f:
        query_text = f.read()

    with open(args.choices) as f:
        choices_text = [l.strip() for l in f.readlines()]
    stimuli = [{"text": s, "expected": -1} for s in stimuli]
    return {
        "pretext": header_text,
        "context": stimuli,
        "posttext": query_text,
        "queries": choices_text,
    }


def write_outputs(outputs, args):
    with open(args.output, "w") as f:
        json.dump(outputs, f)
    print(
        "Now run: python -m probsem --prompt codex_baseline --test v1 from within the probsem directory."
    )


def main():
    args = parser.parse_args()
    stimuli = load_stimuli(args)
    outputs = construct_probsem_benchmark(stimuli, args)
    write_outputs(outputs, args)


if __name__ == "__main__":
    main()
