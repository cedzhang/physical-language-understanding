"""
create_codex_benchmark.py 

Data preprocessing script to construct the Codex baseline data.
"""
import argparse
import json
import csv
import os
from collections import defaultdict

import random

random.seed(0)

scenario_setup = "Scenario: Imagine there is a table. "

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
    default="codex-baseline/probsem/inputs/",
    help="Filepath to output.",
)

# Construct simulated multi-shot experiment.
parser.add_argument(
    "--prompts",
    type=str,
    default="experiments/run-2023-01-31-23-30/codex/prompts",
    help="Directory to the prompts used to run the main model experiments.",
)
parser.add_argument(
    "--human_data", type=str, default="data/human-experiment/human_data.csv"
)


def load_stimuli(args):
    with open(args.stimuli) as f:
        reader = csv.DictReader(f)
        return {int(s["task_id"]): s["language_full"] for s in reader}


def construct_zeroshot_probsem_benchmark(stimuli, args):
    with open(args.header) as f:
        header_text = f.read()

    with open(args.query) as f:
        query_text = f.read()

    with open(args.choices) as f:
        choices_text = [l.strip() for l in f.readlines()]
    stimuli = [{"text": s, "expected": -1} for s in stimuli.values()]
    return {
        "pretext": header_text + "\n" + scenario_setup,
        "context": stimuli,
        "posttext": query_text,
        "queries": choices_text,
    }


def load_human_data(args):
    human_data = defaultdict(list)
    with open(args.human_data) as f:
        reader = csv.DictReader(f)
        for d in reader:
            human_data[int(float(d["task_id"]))].append(int(d["response"]))
    return human_data


def get_human_examples(task_id, stimuli, human_data, choices_text, query_text, args):
    # Load the prompt task.
    task_id_str = str(task_id).zfill(3)
    with open(os.path.join(args.prompts, f"prompt_task_{task_id_str}.json")) as f:
        prompt_task_ids = json.load(f)["prompt_task_ids"]
    # Now, sample human data for these prompts to construct (query, answer) strings.
    examples = []
    for prompt_task_id in prompt_task_ids:
        stimuli_text = stimuli[prompt_task_id]
        choice_idx = (
            random.choice(human_data[prompt_task_id]) - 1
        )  # Zero-index so we can index into a list.

        example = (
            f"{scenario_setup}{stimuli_text}{query_text}\n{choices_text[choice_idx]}"
        )
        examples.append(example)
    return examples


def construct_nshot_probsem_benchmark(stimuli, human_data, args):
    with open(args.header) as f:
        header_text = f.read()

    with open(args.query) as f:
        query_text = f.read()

    with open(args.choices) as f:
        choices_text = [l.strip() for l in f.readlines()]

    context_stimuli = []
    for task_id in range(len(stimuli)):
        task_id = task_id + 1  # 1 indexed.
        human_examples = get_human_examples(
            task_id, stimuli, human_data, choices_text, query_text, args
        )
        stimuli_text = stimuli[task_id]
        # Construct the benchmark out of the examples.
        examples_and_scenario = (
            "\n" + "\n".join(human_examples) + "\n" + f"{scenario_setup}{stimuli_text}"
        )
        context_stimuli.append({"text": examples_and_scenario, "expected": -1})

    return {
        "pretext": header_text,
        "context": context_stimuli,
        "posttext": query_text,
        "queries": choices_text,
    }


def write_outputs(outputs, args, output_name=None):
    with open(os.path.join(args.output, output_name), "w") as f:
        json.dump(outputs, f)
    print(
        f"Now run: python -m probsem --prompt codex_baseline --test {output_name} from within the probsem directory."
    )


def main():
    args = parser.parse_args()

    stimuli = load_stimuli(args)
    outputs = construct_zeroshot_probsem_benchmark(stimuli, args)
    write_outputs(outputs, args, output_name="codex_baseline_v1_zeroshot.json")

    human_data = load_human_data(args)
    outputs = construct_nshot_probsem_benchmark(stimuli, human_data, args)
    write_outputs(outputs, args, output_name="codex_baseline_v1_fewshot.json")


if __name__ == "__main__":
    main()
